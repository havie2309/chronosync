import { normalizeTaskInput, type NormalizedTaskInput } from "./tasks.service.js";

type ParseGoalsInput = {
  text: string;
};

type ParseGoalsResult = {
  tasks: NormalizedTaskInput[];
  parserMode: "mock";
};

function inferDurationMinutes(segment: string) {
  const hourMatch = segment.match(/(\d+)\s*hour/);
  if (hourMatch) {
    return Number(hourMatch[1]) * 60;
  }

  const minuteMatch = segment.match(/(\d+)\s*min/);
  if (minuteMatch) {
    return Number(minuteMatch[1]);
  }

  if (segment.includes("assignment") || segment.includes("lab")) {
    return 120;
  }

  if (segment.includes("gym") || segment.includes("workout")) {
    return 60;
  }

  return 90;
}

function inferPriority(segment: string) {
  if (segment.includes("before") || segment.includes("deadline") || segment.includes("finish")) {
    return 1;
  }

  if (segment.includes("this week")) {
    return 2;
  }

  return 3;
}

function inferDeadline(segment: string) {
  const beforeMatch = segment.match(/before\s+([a-z]+(?:\s+\d+(?::\d+)?\s*(?:am|pm)?)?)/i);
  return beforeMatch ? beforeMatch[1].trim() : null;
}

function inferRecurrence(segment: string) {
  const timesMatch = segment.match(/(\d+)\s+times?\s+(?:this|per)\s+week/i);
  if (timesMatch) {
    return `${timesMatch[1]}_times_this_week`;
  }

  if (segment.includes("daily") || segment.includes("every day")) {
    return "daily";
  }

  return null;
}

function inferPreferredTimeWindow(segment: string) {
  if (segment.includes("evening") || segment.includes("evenings")) {
    return "evening";
  }

  if (segment.includes("morning") || segment.includes("mornings")) {
    return "morning";
  }

  if (segment.includes("afternoon")) {
    return "afternoon";
  }

  return null;
}

function inferEstimatedEffort(durationMinutes: number) {
  if (durationMinutes >= 180) {
    return "high";
  }

  if (durationMinutes >= 90) {
    return "medium";
  }

  return "low";
}

function segmentToTitle(segment: string) {
  return segment
    .replace(/\bbefore\b.*$/i, "")
    .replace(/\b(\d+)\s+times?\s+(?:this|per)\s+week\b/gi, "")
    .replace(/\b(on|in)\s+\d+\s+evenings?\b/gi, "")
    .replace(/\b(this week|daily|every day)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

async function parseGoalsToTasks(input: ParseGoalsInput): Promise<ParseGoalsResult> {
  const cleaned = input.text.trim();

  if (!cleaned) {
    throw new Error("Goal text is required");
  }

  const rawSegments = cleaned
    .split(/,|\band\b/gi)
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean);

  const tasks = rawSegments.map((segment) => {
    const durationMinutes = inferDurationMinutes(segment);

    return normalizeTaskInput({
      title: segmentToTitle(segment),
      durationMinutes,
      priority: inferPriority(segment),
      deadline: inferDeadline(segment),
      recurrence: inferRecurrence(segment),
      preferredTimeWindow: inferPreferredTimeWindow(segment),
      estimatedEffort: inferEstimatedEffort(durationMinutes),
      status: "pending"
    });
  });

  return {
    tasks,
    parserMode: "mock"
  };
}

export { parseGoalsToTasks };
export type { ParseGoalsInput, ParseGoalsResult };
