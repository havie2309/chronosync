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

export { parseTasks };
export type { ParseTasksResponse, ParsedTask };
