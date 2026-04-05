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

export { getTasks, parseTasks, saveTasks };
export type { GetTasksResponse, ParsedTask, SaveTasksResponse, SavedTask };
