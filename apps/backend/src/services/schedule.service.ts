import { prisma } from "../lib/prisma.js";

type GenerateScheduleInput = {
  userId: string;
  weekStart?: string;
};

type GetWeekScheduleInput = {
  userId: string;
  weekStart?: string;
};

type ScheduledTask = {
  taskId: string;
  title: string;
  startTime: Date;
  endTime: Date;
};

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function resolveWeekStart(weekStart?: string) {
  if (weekStart) {
    const parsed = new Date(weekStart);
    if (!Number.isNaN(parsed.getTime())) {
      return startOfDay(parsed);
    }
  }

  return startOfDay(new Date());
}

function getWeekEnd(weekStart: Date) {
  const result = new Date(weekStart);
  result.setDate(result.getDate() + 7);
  return result;
}

function getDayWindow(baseDate: Date) {
  const start = new Date(baseDate);
  start.setHours(9, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(21, 0, 0, 0);

  return { start, end };
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function compareTasks(a: { deadline: Date | null; priority: number; createdAt: Date }, b: { deadline: Date | null; priority: number; createdAt: Date }) {
  if (a.deadline && b.deadline) {
    if (a.deadline.getTime() !== b.deadline.getTime()) {
      return a.deadline.getTime() - b.deadline.getTime();
    }
  } else if (a.deadline) {
    return -1;
  } else if (b.deadline) {
    return 1;
  }

  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }

  return a.createdAt.getTime() - b.createdAt.getTime();
}

function buildSchedule(tasks: Array<{ id: string; title: string; durationMinutes: number; deadline: Date | null; priority: number; createdAt: Date }>, weekStart: Date) {
  const scheduled: ScheduledTask[] = [];
  let currentDay = new Date(weekStart);
  let { start: cursor, end: dayEnd } = getDayWindow(currentDay);

  for (const task of tasks) {
    const taskMinutes = task.durationMinutes;

    while (true) {
      const candidateEnd = new Date(cursor.getTime() + taskMinutes * 60 * 1000);

      if (candidateEnd <= dayEnd) {
        scheduled.push({
          taskId: task.id,
          title: task.title,
          startTime: new Date(cursor),
          endTime: candidateEnd
        });

        cursor = new Date(candidateEnd);
        break;
      }

      currentDay = addDays(currentDay, 1);
      const nextWindow = getDayWindow(currentDay);
      cursor = nextWindow.start;
      dayEnd = nextWindow.end;
    }
  }

  return scheduled;
}

async function generateSchedule(input: GenerateScheduleInput) {
  const tasks = await prisma.task.findMany({
    where: {
      status: {
        in: ["pending", "scheduled"]
      },
      taskList: {
        userId: input.userId
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const sortedTasks = [...tasks].sort(compareTasks);
  const weekStart = resolveWeekStart(input.weekStart);
  const weekEnd = getWeekEnd(weekStart);

  const schedulerRun = await prisma.schedulerRun.create({
    data: {
      userId: input.userId,
      status: "running",
      inputSummary: `Scheduled ${sortedTasks.length} task(s) starting ${weekStart.toISOString()}`
    }
  });

  const scheduledTasks = buildSchedule(sortedTasks, weekStart);

  const createdBlocks = await prisma.$transaction(async (tx) => {
    const existingBlocks = await tx.timeBlock.findMany({
      where: {
        userId: input.userId,
        type: "task",
        status: "scheduled",
        startTime: {
          gte: weekStart,
          lt: weekEnd
        }
      },
      select: {
        taskId: true
      }
    });

    const existingTaskIds = existingBlocks
      .map((block) => block.taskId)
      .filter((taskId): taskId is string => Boolean(taskId));

    if (existingTaskIds.length > 0) {
      await tx.task.updateMany({
        where: {
          id: {
            in: existingTaskIds
          }
        },
        data: {
          status: "pending"
        }
      });
    }

    await tx.timeBlock.deleteMany({
      where: {
        userId: input.userId,
        type: "task",
        status: "scheduled",
        startTime: {
          gte: weekStart,
          lt: weekEnd
        }
      }
    });

    const nextBlocks = [];

    for (const task of scheduledTasks) {
      const createdBlock = await tx.timeBlock.create({
        data: {
          userId: input.userId,
          taskId: task.taskId,
          schedulerRunId: schedulerRun.id,
          title: task.title,
          startTime: task.startTime,
          endTime: task.endTime,
          type: "task",
          status: "scheduled"
        }
      });

      nextBlocks.push(createdBlock);
    }

    const nextTaskIds = scheduledTasks.map((task) => task.taskId);

    if (nextTaskIds.length > 0) {
      await tx.task.updateMany({
        where: {
          id: {
            in: nextTaskIds
          }
        },
        data: {
          status: "scheduled"
        }
      });
    }

    return nextBlocks;
  });

  await prisma.schedulerRun.update({
    where: { id: schedulerRun.id },
    data: {
      status: "completed",
      completedAt: new Date(),
      unscheduledCount: 0
    }
  });

  return {
    schedulerRunId: schedulerRun.id,
    weekStart,
    timeBlocks: createdBlocks
  };
}

async function getWeekSchedule(input: GetWeekScheduleInput) {
  const resolvedWeekStart = resolveWeekStart(input.weekStart);
  const resolvedWeekEnd = getWeekEnd(resolvedWeekStart);

  const timeBlocks = await prisma.timeBlock.findMany({
    where: {
      userId: input.userId,
      startTime: {
        gte: resolvedWeekStart,
        lt: resolvedWeekEnd
      }
    },
    orderBy: {
      startTime: "asc"
    },
    include: {
      task: true,
      schedulerRun: true
    }
  });

  return {
    weekStart: resolvedWeekStart,
    weekEnd: resolvedWeekEnd,
    timeBlocks
  };
}

export { generateSchedule, getWeekSchedule };
export type { GenerateScheduleInput, GetWeekScheduleInput };
