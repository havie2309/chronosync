import { prisma } from "../lib/prisma.js";

async function getMetricsSummary(userId: string) {
  const [taskCount, pendingTaskCount, inProgressTaskCount, scheduledTaskCount, totalTimeBlockCount, weekTimeBlockCount, schedulerRunCount, lastSchedulerRun] =
    await Promise.all([
      prisma.task.count({
        where: {
          taskList: {
            userId
          }
        }
      }),
      prisma.task.count({
        where: {
          status: "pending",
          taskList: {
            userId
          }
        }
      }),
      prisma.task.count({
        where: {
          status: "in_progress",
          taskList: {
            userId
          }
        }
      }),
      prisma.task.count({
        where: {
          status: "scheduled",
          taskList: {
            userId
          }
        }
      }),
      prisma.timeBlock.count({
        where: {
          userId
        }
      }),
      prisma.timeBlock.count({
        where: {
          userId,
          startTime: {
            gte: startOfCurrentWeek(),
            lt: endOfCurrentWeek()
          }
        }
      }),
      prisma.schedulerRun.count({
        where: {
          userId
        }
      }),
      prisma.schedulerRun.findFirst({
        where: {
          userId
        },
        orderBy: {
          startedAt: "desc"
        }
      })
    ]);

  return {
    tasks: {
      total: taskCount,
      pending: pendingTaskCount,
      inProgress: inProgressTaskCount,
      scheduled: scheduledTaskCount
    },
    schedule: {
      totalTimeBlocks: totalTimeBlockCount,
      currentWeekTimeBlocks: weekTimeBlockCount,
      schedulerRuns: schedulerRunCount,
      lastSchedulerRunAt: lastSchedulerRun?.startedAt ?? null
    }
  };
}

function startOfCurrentWeek() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function endOfCurrentWeek() {
  const end = startOfCurrentWeek();
  end.setDate(end.getDate() + 7);
  return end;
}

export { getMetricsSummary };
