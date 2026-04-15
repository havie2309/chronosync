import assert from "node:assert/strict";
import test from "node:test";
import { scheduleTestUtils } from "./schedule.service.js";

const { buildSchedule, compareTasks, getWeekEnd, resolveWeekStart } = scheduleTestUtils;

function makeTask(overrides: Partial<{
  id: string;
  title: string;
  durationMinutes: number;
  deadline: Date | null;
  priority: number;
  createdAt: Date;
}> = {}) {
  return {
    id: overrides.id ?? "task-1",
    title: overrides.title ?? "Task",
    durationMinutes: overrides.durationMinutes ?? 60,
    deadline: overrides.deadline ?? null,
    priority: overrides.priority ?? 3,
    createdAt: overrides.createdAt ?? new Date("2026-04-13T10:00:00.000Z")
  };
}

test("resolveWeekStart returns the start of the provided date-only day", () => {
  const weekStart = resolveWeekStart("2026-04-13");

  assert.equal(weekStart.getHours(), 0);
  assert.equal(weekStart.getMinutes(), 0);
  assert.equal(weekStart.getSeconds(), 0);
  assert.equal(weekStart.getMilliseconds(), 0);
});

test("getWeekEnd returns seven days after week start", () => {
  const weekStart = resolveWeekStart("2026-04-13");
  const weekEnd = getWeekEnd(weekStart);

  assert.equal(weekEnd.getTime() - weekStart.getTime(), 7 * 24 * 60 * 60 * 1000);
});

test("compareTasks prioritizes earlier deadlines before priority", () => {
  const withLaterDeadline = makeTask({
    id: "later",
    deadline: new Date("2026-04-18T12:00:00.000Z"),
    priority: 1
  });
  const withEarlierDeadline = makeTask({
    id: "earlier",
    deadline: new Date("2026-04-15T12:00:00.000Z"),
    priority: 5
  });

  const sorted = [withLaterDeadline, withEarlierDeadline].sort(compareTasks);

  assert.equal(sorted[0].id, "earlier");
});

test("compareTasks prioritizes lower priority number when deadlines match", () => {
  const lowPriority = makeTask({ id: "low", priority: 5 });
  const highPriority = makeTask({ id: "high", priority: 1 });

  const sorted = [lowPriority, highPriority].sort(compareTasks);

  assert.equal(sorted[0].id, "high");
});

test("buildSchedule creates sequential non-overlapping blocks", () => {
  const weekStart = resolveWeekStart("2026-04-13");
  const tasks = [
    makeTask({ id: "physics", title: "Study physics", durationMinutes: 90 }),
    makeTask({ id: "math", title: "Finish math", durationMinutes: 120 }),
    makeTask({ id: "gym", title: "Gym", durationMinutes: 60 })
  ];

  const schedule = buildSchedule(tasks, weekStart);

  assert.equal(schedule.length, 3);
  assert.equal(schedule[0].startTime.getHours(), 9);
  assert.equal(schedule[0].endTime.getTime(), schedule[1].startTime.getTime());
  assert.equal(schedule[1].endTime.getTime(), schedule[2].startTime.getTime());

  for (let index = 1; index < schedule.length; index += 1) {
    assert.ok(schedule[index].startTime >= schedule[index - 1].endTime);
  }
});

test("buildSchedule moves tasks to the next day when the day window is full", () => {
  const weekStart = resolveWeekStart("2026-04-13");
  const tasks = [
    makeTask({ id: "long-1", durationMinutes: 12 * 60 }),
    makeTask({ id: "long-2", durationMinutes: 60 })
  ];

  const schedule = buildSchedule(tasks, weekStart);

  assert.equal(schedule.length, 2);
  assert.equal(schedule[0].startTime.getHours(), 9);
  assert.equal(schedule[0].endTime.getHours(), 21);
  assert.equal(schedule[1].startTime.getHours(), 9);
  assert.notEqual(schedule[0].startTime.getDate(), schedule[1].startTime.getDate());
});
