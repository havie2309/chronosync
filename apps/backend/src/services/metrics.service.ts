import { prisma } from "../lib/prisma.js";
import { getWeekEnd, resolveWeekStart } from "../utils/date.js";

async function getMetricsSummary(userId: string) {
  const currentWeekStart = resolveWeekStart();
  const currentWeekEnd = getWeekEnd(currentWeekStart);
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
            gte: currentWeekStart,
            lt: currentWeekEnd
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

export { getMetricsSummary };
