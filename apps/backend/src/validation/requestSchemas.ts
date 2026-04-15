import { z } from "zod";
import { isDateOnlyString, isValidDateString } from "../utils/date.js";

const optionalTextSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional()
);

const nullableTextSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().min(1).nullable().optional()
);

const nullableDateSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z
    .string()
    .trim()
    .refine(isValidDateString, "Must be a valid date string")
    .nullable()
    .optional()
);

const taskStatusSchema = z.enum(["pending", "in_progress", "scheduled", "completed"]).optional();

const taskBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160, "Title is too long"),
  description: optionalTextSchema,
  durationMinutes: z.coerce.number().int().positive("Duration must be positive").max(24 * 60, "Duration is too long"),
  priority: z.coerce.number().int().min(1).max(5).optional(),
  deadline: nullableDateSchema,
  recurrence: nullableTextSchema,
  preferredTimeWindow: nullableTextSchema,
  estimatedEffort: nullableTextSchema,
  status: taskStatusSchema
});

const createTaskBodySchema = taskBaseSchema;

const bulkCreateTasksBodySchema = z.object({
  tasks: z.array(taskBaseSchema).min(1, "At least one task is required").max(50, "Too many tasks in one request")
});

const updateTaskBodySchema = taskBaseSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});

const parseTasksBodySchema = z.object({
  text: z.string().trim().min(1, "Text is required").max(5000, "Text is too long")
});

const createSessionBodySchema = z.object({
  email: z.string().trim().email("A valid email is required"),
  name: optionalTextSchema,
  photoUrl: optionalTextSchema
});

const scheduleBodySchema = z.object({
  weekStart: z
    .string()
    .trim()
    .refine(isDateOnlyString, "weekStart must use YYYY-MM-DD format")
    .optional()
});

function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}

export {
  bulkCreateTasksBodySchema,
  createSessionBodySchema,
  createTaskBodySchema,
  formatZodError,
  parseTasksBodySchema,
  scheduleBodySchema,
  updateTaskBodySchema
};
