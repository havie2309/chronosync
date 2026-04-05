import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { deleteTask, getTasks, updateTask, type ParsedTask, type SavedTask } from "../services/api";

function getStatusBadgeStyle(status: string) {
  if (status === "scheduled") {
    return {
      background: "#ecfdf3",
      color: "#027a48"
    };
  }

  if (status === "in_progress") {
    return {
      background: "#eff6ff",
      color: "#1d4ed8"
    };
  }

  return {
    background: "#fef3c7",
    color: "#b45309"
  };
}

function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<SavedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState("");
  const [editingTaskId, setEditingTaskId] = useState("");
  const [savingTaskId, setSavingTaskId] = useState("");
  const [editDraft, setEditDraft] = useState<Partial<ParsedTask>>({});
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "scheduled">("all");

  const scheduledTasks = tasks.filter((task) => task.status === "scheduled");
  const activeTasks = tasks.filter((task) => task.status !== "scheduled");
  const visibleTasks = statusFilter === "all" ? tasks : tasks.filter((task) => task.status === statusFilter);

  async function loadTasks(currentUser = user) {
    if (!currentUser) {
      setError("You must be signed in to view tasks.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getTasks(currentUser);
      setTasks(result.tasks);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, [user]);

  async function handleDeleteTask(taskId: string) {
    if (!user) {
      setError("You must be signed in to delete tasks.");
      return;
    }

    setDeletingTaskId(taskId);
    setError("");

    try {
      await deleteTask(taskId, user);
      await loadTasks(user);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to delete task");
    } finally {
      setDeletingTaskId("");
    }
  }

  function startEditing(task: SavedTask) {
    setEditingTaskId(task.id);
    setEditDraft({
      title: task.title,
      description: task.description,
      durationMinutes: task.durationMinutes,
      priority: task.priority,
      deadline: task.deadline,
      recurrence: task.recurrence,
      preferredTimeWindow: task.preferredTimeWindow,
      estimatedEffort: task.estimatedEffort,
      status: task.status
    });
    setError("");
  }

  function cancelEditing() {
    setEditingTaskId("");
    setSavingTaskId("");
    setEditDraft({});
  }

  async function handleSaveEdit(taskId: string) {
    if (!user) {
      setError("You must be signed in to update tasks.");
      return;
    }

    setSavingTaskId(taskId);
    setError("");

    try {
      await updateTask(taskId, editDraft, user);
      cancelEditing();
      await loadTasks(user);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to update task");
    } finally {
      setSavingTaskId("");
    }
  }

  return (
    <section>
      <p style={{ margin: 0, color: "#486581", fontWeight: 700 }}>Tasks</p>
      <h2 style={{ margin: "8px 0 12px", fontSize: "2rem", color: "#102a43" }}>Task review and editing</h2>
      <p style={{ maxWidth: "720px", color: "#627d98", lineHeight: 1.7 }}>
        This page will list parsed and saved tasks, show status, and later support edit and delete actions from the UI.
      </p>

      {isLoading ? (
        <div style={{ marginTop: "24px", padding: "24px", borderRadius: "20px", background: "#fff", maxWidth: "900px" }}>
          <p style={{ margin: 0, color: "#627d98" }}>Loading tasks...</p>
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            marginTop: "24px",
            padding: "16px 18px",
            borderRadius: "16px",
            background: "#fde8e8",
            color: "#9b1c1c",
            maxWidth: "900px"
          }}
        >
          {error}
        </div>
      ) : null}

      {!isLoading && !error && tasks.length === 0 ? (
        <div style={{ marginTop: "24px", padding: "24px", borderRadius: "20px", background: "#fff", maxWidth: "900px" }}>
          <p style={{ marginTop: 0, fontWeight: 700 }}>No saved tasks yet</p>
          <p style={{ marginBottom: 0, color: "#627d98" }}>
            Parse and save tasks from the Goals page, then they&apos;ll appear here.
          </p>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div style={{ marginTop: "24px", display: "grid", gap: "16px", maxWidth: "900px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "18px", borderRadius: "18px", background: "#fff" }}>
              <div style={{ color: "#627d98", fontSize: "0.9rem" }}>Total tasks</div>
              <div style={{ marginTop: "8px", fontSize: "1.8rem", fontWeight: 800, color: "#102a43" }}>{tasks.length}</div>
            </div>
            <div style={{ padding: "18px", borderRadius: "18px", background: "#fff" }}>
              <div style={{ color: "#627d98", fontSize: "0.9rem" }}>Scheduled</div>
              <div style={{ marginTop: "8px", fontSize: "1.8rem", fontWeight: 800, color: "#027a48" }}>{scheduledTasks.length}</div>
            </div>
            <div style={{ padding: "18px", borderRadius: "18px", background: "#fff" }}>
              <div style={{ color: "#627d98", fontSize: "0.9rem" }}>Still active</div>
              <div style={{ marginTop: "8px", fontSize: "1.8rem", fontWeight: 800, color: "#b45309" }}>{activeTasks.length}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#486581", fontWeight: 700 }}>Filter</span>
            {[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "In Progress", value: "in_progress" },
              { label: "Scheduled", value: "scheduled" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value as "all" | "pending" | "in_progress" | "scheduled")}
                style={{
                  border: statusFilter === option.value ? "1px solid #102a43" : "1px solid #d9e2ec",
                  borderRadius: "999px",
                  padding: "8px 12px",
                  background: statusFilter === option.value ? "#102a43" : "#fff",
                  color: statusFilter === option.value ? "#fff" : "#486581",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {visibleTasks.map((task) => (
            <article
              key={task.id}
              style={{
                padding: "20px",
                borderRadius: "18px",
                background: "#fff",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                border: task.status === "scheduled" ? "1px solid #bbf7d0" : "1px solid transparent"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start" }}>
                {editingTaskId === task.id ? (
                  <div style={{ flex: 1, display: "grid", gap: "10px" }}>
                    <input
                      value={editDraft.title ?? ""}
                      onChange={(event) => setEditDraft((current) => ({ ...current, title: event.target.value }))}
                      style={{ borderRadius: "12px", border: "1px solid #cbd2d9", padding: "10px 12px", fontSize: "1rem" }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                      <input
                        type="number"
                        min={1}
                        value={editDraft.durationMinutes ?? ""}
                        onChange={(event) =>
                          setEditDraft((current) => ({ ...current, durationMinutes: Number(event.target.value) || task.durationMinutes }))
                        }
                        style={{ borderRadius: "12px", border: "1px solid #cbd2d9", padding: "10px 12px" }}
                      />
                      <select
                        value={editDraft.priority ?? task.priority}
                        onChange={(event) => setEditDraft((current) => ({ ...current, priority: Number(event.target.value) }))}
                        style={{ borderRadius: "12px", border: "1px solid #cbd2d9", padding: "10px 12px" }}
                      >
                        <option value={1}>Priority 1</option>
                        <option value={2}>Priority 2</option>
                        <option value={3}>Priority 3</option>
                        <option value={4}>Priority 4</option>
                        <option value={5}>Priority 5</option>
                      </select>
                      <select
                        value={editDraft.status ?? task.status}
                        onChange={(event) => setEditDraft((current) => ({ ...current, status: event.target.value }))}
                        style={{ borderRadius: "12px", border: "1px solid #cbd2d9", padding: "10px 12px" }}
                      >
                        <option value="pending">pending</option>
                        <option value="in_progress">in_progress</option>
                        <option value="scheduled">scheduled</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ margin: 0, color: "#102a43" }}>{task.title}</h3>
                    <p style={{ margin: "8px 0 0", color: "#627d98" }}>
                      Duration: {task.durationMinutes} min | Priority: {task.priority}
                    </p>
                  </div>
                )}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: "#eef2ff",
                      color: "#4338ca",
                      fontSize: "0.85rem",
                      fontWeight: 700
                    }}
                  >
                    Saved
                  </span>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      ...getStatusBadgeStyle(task.status)
                    }}
                  >
                    {task.status}
                  </span>
                  {editingTaskId === task.id ? (
                    <>
                      <button
                        onClick={() => void handleSaveEdit(task.id)}
                        disabled={savingTaskId === task.id}
                        style={{
                          border: "1px solid #bbf7d0",
                          borderRadius: "999px",
                          padding: "6px 10px",
                          background: "#f0fdf4",
                          color: "#166534",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: savingTaskId === task.id ? "default" : "pointer"
                        }}
                      >
                        {savingTaskId === task.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={savingTaskId === task.id}
                        style={{
                          border: "1px solid #d9e2ec",
                          borderRadius: "999px",
                          padding: "6px 10px",
                          background: "#fff",
                          color: "#486581",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: savingTaskId === task.id ? "default" : "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(task)}
                      disabled={Boolean(deletingTaskId)}
                      style={{
                        border: "1px solid #bfdbfe",
                        borderRadius: "999px",
                        padding: "6px 10px",
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: deletingTaskId ? "default" : "pointer"
                      }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => void handleDeleteTask(task.id)}
                    disabled={deletingTaskId === task.id || editingTaskId === task.id}
                    style={{
                      border: "1px solid #fecaca",
                      borderRadius: "999px",
                      padding: "6px 10px",
                      background: "#fff5f5",
                      color: "#b91c1c",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: deletingTaskId === task.id ? "default" : "pointer"
                    }}
                  >
                    {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {editingTaskId === task.id ? (
                <div style={{ marginTop: "14px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                  <input
                    value={editDraft.deadline ?? ""}
                    onChange={(event) => setEditDraft((current) => ({ ...current, deadline: event.target.value || null }))}
                    placeholder="Deadline"
                    style={{ borderRadius: "12px", border: "1px solid #cbd2d9", padding: "10px 12px" }}
                  />
                  <input
                    value={editDraft.recurrence ?? ""}
                    onChange={(event) => setEditDraft((current) => ({ ...current, recurrence: event.target.value || null }))}
                    placeholder="Recurrence"
                    style={{ borderRadius: "12px", border: "1px solid #cbd2d9", padding: "10px 12px" }}
                  />
                  <input
                    value={editDraft.preferredTimeWindow ?? ""}
                    onChange={(event) =>
                      setEditDraft((current) => ({ ...current, preferredTimeWindow: event.target.value || null }))
                    }
                    placeholder="Preferred window"
                    style={{ borderRadius: "12px", border: "1px solid #cbd2d9", padding: "10px 12px" }}
                  />
                  <input
                    value={editDraft.estimatedEffort ?? ""}
                    onChange={(event) =>
                      setEditDraft((current) => ({ ...current, estimatedEffort: event.target.value || null }))
                    }
                    placeholder="Estimated effort"
                    style={{ borderRadius: "12px", border: "1px solid #cbd2d9", padding: "10px 12px" }}
                  />
                  <textarea
                    value={editDraft.description ?? ""}
                    onChange={(event) =>
                      setEditDraft((current) => ({ ...current, description: event.target.value || undefined }))
                    }
                    placeholder="Description"
                    rows={3}
                    style={{
                      gridColumn: "1 / -1",
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      resize: "vertical"
                    }}
                  />
                </div>
              ) : (
                <div style={{ marginTop: "14px", display: "grid", gap: "8px", color: "#486581" }}>
                  <div>Deadline: {task.deadline ?? "None"}</div>
                  <div>Recurrence: {task.recurrence ?? "None"}</div>
                  <div>Preferred window: {task.preferredTimeWindow ?? "None"}</div>
                  <div>Estimated effort: {task.estimatedEffort ?? "None"}</div>
                </div>
              )}
            </article>
          ))}

          {visibleTasks.length === 0 ? (
            <div style={{ padding: "24px", borderRadius: "18px", background: "#fff", color: "#627d98" }}>
              No tasks match the current filter.
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export { TasksPage };
