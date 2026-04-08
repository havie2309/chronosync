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

type ResetScheduleResponse = {
  weekStart: string;
  weekEnd: string;
  deletedCount: number;
};

type DeleteTaskResponse = {
  success: boolean;
};

type UpdateTaskResponse = {
  task: SavedTask;
};

type MetricsSummaryResponse = {
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    scheduled: number;
  };
  schedule: {
    totalTimeBlocks: number;
    currentWeekTimeBlocks: number;
    schedulerRuns: number;
    lastSchedulerRunAt: string | null;
  };
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type ApiErrorBody = {
  error?: string;
  retryAfterSeconds?: number;
};

async function requestJson<T>(url: string, init: RequestInit, fallbackMessage: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    throw new Error("Could not reach the backend. Make sure the API server is running.");
  }

  if (!response.ok) {
    let errorBody: ApiErrorBody | null = null;

    try {
      errorBody = (await response.json()) as ApiErrorBody;
    } catch {
      errorBody = null;
    }

    if (response.status === 429 && errorBody?.retryAfterSeconds) {
      throw new Error(`Too many requests. Please try again in ${errorBody.retryAfterSeconds} seconds.`);
    }

    throw new Error(errorBody?.error ?? fallbackMessage);
  }

  return (await response.json()) as T;
}

async function parseTasks(text: string, user: AuthUser): Promise<ParseTasksResponse> {
  return requestJson<ParseTasksResponse>(
    `${API_URL}/api/tasks/parse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user.email
      },
      body: JSON.stringify({ text })
    },
    "Failed to parse tasks"
  );
}

async function saveTasks(tasks: ParsedTask[], user: AuthUser): Promise<SaveTasksResponse> {
  const sanitizedTasks = tasks.map((task) => ({
    ...task,
    deadline: task.deadline && task.deadline.includes("-") ? task.deadline : null
  }));

  return requestJson<SaveTasksResponse>(
    `${API_URL}/api/tasks/bulk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user.email
      },
      body: JSON.stringify({ tasks: sanitizedTasks })
    },
    "Failed to save tasks"
  );
}

async function getTasks(user: AuthUser): Promise<GetTasksResponse> {
  return requestJson<GetTasksResponse>(
    `${API_URL}/api/tasks`,
    {
      method: "GET",
      headers: {
        "x-user-email": user.email
      }
    },
    "Failed to fetch tasks"
  );
}

async function getWeekSchedule(user: AuthUser, weekStart?: string): Promise<GetWeekScheduleResponse> {
  const url = new URL(`${API_URL}/api/schedule/week`);

  if (weekStart) {
    url.searchParams.set("weekStart", weekStart);
  }

  return requestJson<GetWeekScheduleResponse>(
    url.toString(),
    {
      method: "GET",
      headers: {
        "x-user-email": user.email
      }
    },
    "Failed to fetch weekly schedule"
  );
}

async function generateSchedule(user: AuthUser, weekStart?: string): Promise<GenerateScheduleResponse> {
  return requestJson<GenerateScheduleResponse>(
    `${API_URL}/api/schedule/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user.email
      },
      body: JSON.stringify(weekStart ? { weekStart } : {})
    },
    "Failed to generate schedule"
  );
}

async function resetSchedule(user: AuthUser, weekStart?: string): Promise<ResetScheduleResponse> {
  return requestJson<ResetScheduleResponse>(
    `${API_URL}/api/schedule/reset`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user.email
      },
      body: JSON.stringify(weekStart ? { weekStart } : {})
    },
    "Failed to reset schedule"
  );
}

async function deleteTask(taskId: string, user: AuthUser): Promise<DeleteTaskResponse> {
  return requestJson<DeleteTaskResponse>(
    `${API_URL}/api/tasks/${taskId}`,
    {
      method: "DELETE",
      headers: {
        "x-user-email": user.email
      }
    },
    "Failed to delete task"
  );
}

async function updateTask(taskId: string, updates: Partial<ParsedTask>, user: AuthUser): Promise<UpdateTaskResponse> {
  return requestJson<UpdateTaskResponse>(
    `${API_URL}/api/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user.email
      },
      body: JSON.stringify(updates)
    },
    "Failed to update task"
  );
}

async function getMetricsSummary(user: AuthUser): Promise<MetricsSummaryResponse> {
  return requestJson<MetricsSummaryResponse>(
    `${API_URL}/api/metrics/summary`,
    {
      method: "GET",
      headers: {
        "x-user-email": user.email
      }
    },
    "Failed to fetch metrics summary"
  );
}

export { deleteTask, generateSchedule, getMetricsSummary, getTasks, getWeekSchedule, parseTasks, resetSchedule, saveTasks, updateTask };
export type {
  DeleteTaskResponse,
  GenerateScheduleResponse,
  MetricsSummaryResponse,
  GetTasksResponse,
  GetWeekScheduleResponse,
  ParsedTask,
  ResetScheduleResponse,
  SaveTasksResponse,
  SavedTask,
  ScheduleTimeBlock,
  UpdateTaskResponse
};
