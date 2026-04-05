import type { AuthUser } from "../types/auth";

type ParsedTask = {
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

type ParseTasksResponse = {
  tasks: ParsedTask[];
  parserMode: "mock";
};

type SaveTasksResponse = {
  tasks: Array<
    ParsedTask & {
      id: string;
      taskListId: string;
    }
  >;
};

type SavedTask = ParsedTask & {
  id: string;
  taskListId: string;
  createdAt?: string;
  updatedAt?: string;
};

type GetTasksResponse = {
  tasks: SavedTask[];
};

type ScheduleTimeBlock = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  taskId?: string | null;
};

type GetWeekScheduleResponse = {
  weekStart: string;
  weekEnd: string;
  timeBlocks: ScheduleTimeBlock[];
};

type GenerateScheduleResponse = {
  schedulerRunId: string;
  weekStart: string;
  timeBlocks: ScheduleTimeBlock[];
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function parseTasks(text: string, user: AuthUser): Promise<ParseTasksResponse> {
  const response = await fetch(`${API_URL}/api/tasks/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-email": user.email
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error("Failed to parse tasks");
  }

  return (await response.json()) as ParseTasksResponse;
}

async function saveTasks(tasks: ParsedTask[], user: AuthUser): Promise<SaveTasksResponse> {
  const sanitizedTasks = tasks.map((task) => ({
    ...task,
    deadline: task.deadline && task.deadline.includes("-") ? task.deadline : null
  }));

  const response = await fetch(`${API_URL}/api/tasks/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-email": user.email
    },
    body: JSON.stringify({ tasks: sanitizedTasks })
  });

  if (!response.ok) {
    throw new Error("Failed to save tasks");
  }

  return (await response.json()) as SaveTasksResponse;
}

async function getTasks(user: AuthUser): Promise<GetTasksResponse> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "GET",
    headers: {
      "x-user-email": user.email
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return (await response.json()) as GetTasksResponse;
}

async function getWeekSchedule(user: AuthUser, weekStart?: string): Promise<GetWeekScheduleResponse> {
  const url = new URL(`${API_URL}/api/schedule/week`);

  if (weekStart) {
    url.searchParams.set("weekStart", weekStart);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-user-email": user.email
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch weekly schedule");
  }

  return (await response.json()) as GetWeekScheduleResponse;
}

async function generateSchedule(user: AuthUser, weekStart?: string): Promise<GenerateScheduleResponse> {
  const response = await fetch(`${API_URL}/api/schedule/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-email": user.email
    },
    body: JSON.stringify(weekStart ? { weekStart } : {})
  });

  if (!response.ok) {
    throw new Error("Failed to generate schedule");
  }

  return (await response.json()) as GenerateScheduleResponse;
}

export { generateSchedule, getTasks, getWeekSchedule, parseTasks, saveTasks };
export type {
  GenerateScheduleResponse,
  GetTasksResponse,
  GetWeekScheduleResponse,
  ParsedTask,
  SaveTasksResponse,
  SavedTask,
  ScheduleTimeBlock
};
