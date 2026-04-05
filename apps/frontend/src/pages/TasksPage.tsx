import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks, type SavedTask } from "../services/api";

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
  const [error, setError] = useState("");

  const scheduledTasks = tasks.filter((task) => task.status === "scheduled");
  const activeTasks = tasks.filter((task) => task.status !== "scheduled");

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!user) {
        setError("You must be signed in to view tasks.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const result = await getTasks(user);

        if (isMounted) {
          setTasks(result.tasks);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(nextError instanceof Error ? nextError.message : "Failed to fetch tasks");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();

    return () => {
      isMounted = false;
    };
  }, [user]);

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

          {tasks.map((task) => (
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
                <div>
                  <h3 style={{ margin: 0, color: "#102a43" }}>{task.title}</h3>
                  <p style={{ margin: "8px 0 0", color: "#627d98" }}>
                    Duration: {task.durationMinutes} min | Priority: {task.priority}
                  </p>
                </div>
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
                </div>
              </div>

              <div style={{ marginTop: "14px", display: "grid", gap: "8px", color: "#486581" }}>
                <div>Deadline: {task.deadline ?? "None"}</div>
                <div>Recurrence: {task.recurrence ?? "None"}</div>
                <div>Preferred window: {task.preferredTimeWindow ?? "None"}</div>
                <div>Estimated effort: {task.estimatedEffort ?? "None"}</div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export { TasksPage };
