import { prisma } from "../lib/prisma.js";

type BaseTaskShape = {
  title: string;
  description?: string;
  durationMinutes: number;
  priority?: number;
  deadline?: string | null;
  recurrence?: string | null;
  preferredTimeWindow?: string | null;
  estimatedEffort?: string | null;
  status?: string;
};

type CreateTaskInput = BaseTaskShape & {
  userId: string;
};

type UpdateTaskInput = {
  userId: string;
  taskId: string;
  title?: string;
  description?: string | null;
  durationMinutes?: number;
  priority?: number;
  deadline?: string | null;
  recurrence?: string | null;
  preferredTimeWindow?: string | null;
  estimatedEffort?: string | null;
  status?: string;
};

type NormalizedTaskInput = {
  title: string;
  description?: string;
  durationMinutes: number;
  priority: number;
  deadline: string | null;
  recurrence: string | null;
  preferredTimeWindow: string | null;
  estimatedEffort: string | null;
  status: string;
};

function normalizeTaskInput(input: BaseTaskShape): NormalizedTaskInput {
  const title = input.title?.trim();

  if (!title) {
    throw new Error("Task title is required");
  }

  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error("durationMinutes must be a positive number");
  }

  const priority = Number.isFinite(input.priority) ? Math.min(5, Math.max(1, Number(input.priority))) : 3;

  return {
    title,
    description: input.description?.trim() || undefined,
    durationMinutes: Math.round(input.durationMinutes),
    priority,
    deadline: input.deadline ?? null,
    recurrence: input.recurrence ?? null,
    preferredTimeWindow: input.preferredTimeWindow ?? null,
    estimatedEffort: input.estimatedEffort ?? null,
    status: input.status?.trim() || "pending"
  };
}

async function getOrCreateDefaultTaskList(userId: string) {
  const existingList = await prisma.taskList.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  if (existingList) {
    return existingList;
  }

  return prisma.taskList.create({
    data: {
      userId,
      title: "My Tasks"
    }
  });
}

async function createTask(input: CreateTaskInput) {
  const normalized = normalizeTaskInput(input);
  const taskList = await getOrCreateDefaultTaskList(input.userId);

  return prisma.task.create({
    data: {
      taskListId: taskList.id,
      title: normalized.title,
      description: normalized.description,
      durationMinutes: normalized.durationMinutes,
      priority: normalized.priority,
      deadline: normalized.deadline ? new Date(normalized.deadline) : undefined,
      recurrence: normalized.recurrence,
      preferredTimeWindow: normalized.preferredTimeWindow,
      estimatedEffort: normalized.estimatedEffort,
      status: normalized.status
    },
    include: {
      taskList: true
    }
  });
}

async function getTasksForUser(userId: string) {
  return prisma.task.findMany({
    where: {
      taskList: {
        userId
      }
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      taskList: true
    }
  });
}

async function updateTask(input: UpdateTaskInput) {
  const task = await prisma.task.findFirst({
    where: {
      id: input.taskId,
      taskList: {
        userId: input.userId
      }
    }
  });

  if (!task) {
    return null;
  }

  return prisma.task.update({
    where: { id: input.taskId },
    data: {
      title: input.title,
      description: input.description,
      durationMinutes: input.durationMinutes,
      priority: input.priority,
      deadline: input.deadline === null ? null : input.deadline ? new Date(input.deadline) : undefined,
      recurrence: input.recurrence,
      preferredTimeWindow: input.preferredTimeWindow,
      estimatedEffort: input.estimatedEffort,
      status: input.status
    },
    include: {
      taskList: true
    }
  });
}

async function deleteTask(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      taskList: {
        userId
      }
    }
  });

  if (!task) {
    return null;
  }

  await prisma.task.delete({
    where: { id: taskId }
  });

  return { success: true };
}

export { createTask, deleteTask, getOrCreateDefaultTaskList, getTasksForUser, normalizeTaskInput, updateTask };
export type { CreateTaskInput, NormalizedTaskInput, UpdateTaskInput };
