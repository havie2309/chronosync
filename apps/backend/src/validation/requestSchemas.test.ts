import assert from "node:assert/strict";
import test from "node:test";
import {
  bulkCreateTasksBodySchema,
  createSessionBodySchema,
  createTaskBodySchema,
  formatZodError,
  parseTasksBodySchema,
  scheduleBodySchema,
  updateTaskBodySchema
} from "./requestSchemas.js";

const validTask = {
  title: "Study physics",
  durationMinutes: 90,
  priority: 2,
  deadline: "2026-04-17T17:00:00.000Z",
  recurrence: "3_times_this_week",
  preferredTimeWindow: "evening",
  estimatedEffort: "medium",
  status: "pending"
};

test("createTaskBodySchema accepts a valid task", () => {
  const result = createTaskBodySchema.safeParse(validTask);

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.title, "Study physics");
    assert.equal(result.data.durationMinutes, 90);
  }
});

test("createTaskBodySchema trims title and coerces numeric strings", () => {
  const result = createTaskBodySchema.safeParse({
    title: "  Study physics  ",
    durationMinutes: "45",
    priority: "1"
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.title, "Study physics");
    assert.equal(result.data.durationMinutes, 45);
    assert.equal(result.data.priority, 1);
  }
});

test("createTaskBodySchema rejects empty titles", () => {
  const result = createTaskBodySchema.safeParse({
    ...validTask,
    title: "   "
  });

  assert.equal(result.success, false);
});

test("createTaskBodySchema rejects non-positive durations", () => {
  const result = createTaskBodySchema.safeParse({
    ...validTask,
    durationMinutes: 0
  });

  assert.equal(result.success, false);
});

test("createTaskBodySchema rejects priorities outside 1-5", () => {
  const result = createTaskBodySchema.safeParse({
    ...validTask,
    priority: 9
  });

  assert.equal(result.success, false);
});

test("createTaskBodySchema rejects invalid deadline strings", () => {
  const result = createTaskBodySchema.safeParse({
    ...validTask,
    deadline: "Friday"
  });

  assert.equal(result.success, false);
});

test("bulkCreateTasksBodySchema requires at least one task", () => {
  const result = bulkCreateTasksBodySchema.safeParse({
    tasks: []
  });

  assert.equal(result.success, false);
});

test("updateTaskBodySchema rejects empty update bodies", () => {
  const result = updateTaskBodySchema.safeParse({});

  assert.equal(result.success, false);
});

test("updateTaskBodySchema accepts partial valid updates", () => {
  const result = updateTaskBodySchema.safeParse({
    status: "scheduled",
    durationMinutes: 120
  });

  assert.equal(result.success, true);
});

test("parseTasksBodySchema rejects blank goal text", () => {
  const result = parseTasksBodySchema.safeParse({
    text: "   "
  });

  assert.equal(result.success, false);
});

test("createSessionBodySchema requires a valid email", () => {
  const result = createSessionBodySchema.safeParse({
    email: "not-an-email",
    name: "Demo User"
  });

  assert.equal(result.success, false);
});

test("scheduleBodySchema rejects invalid weekStart values", () => {
  const result = scheduleBodySchema.safeParse({
    weekStart: "not-a-date"
  });

  assert.equal(result.success, false);
});

test("formatZodError returns compact path and message details", () => {
  const result = createTaskBodySchema.safeParse({
    title: "",
    durationMinutes: -1
  });

  assert.equal(result.success, false);

  if (!result.success) {
    const details = formatZodError(result.error);

    assert.ok(details.length >= 2);
    assert.ok(details.some((detail) => detail.path === "title"));
    assert.ok(details.some((detail) => detail.path === "durationMinutes"));
  }
});
