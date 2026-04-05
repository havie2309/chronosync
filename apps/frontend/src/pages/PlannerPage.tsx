import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { generateSchedule, getWeekSchedule, type ScheduleTimeBlock } from "../services/api";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function PlannerPage() {
  const { user } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<ScheduleTimeBlock[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadSchedule(currentUser = user) {
    if (!currentUser) {
      setError("You must be signed in to view the planner.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getWeekSchedule(currentUser);
      setTimeBlocks(result.timeBlocks);
      setWeekStart(result.weekStart);
      setWeekEnd(result.weekEnd);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to fetch weekly schedule");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSchedule();
  }, [user]);

  async function handleGenerateSchedule() {
    if (!user) {
      setError("You must be signed in to generate a schedule.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await generateSchedule(user);
      setSuccessMessage(`Generated ${result.timeBlocks.length} time block(s).`);
      await loadSchedule(user);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to generate schedule");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section>
      <p style={{ margin: 0, color: "#486581", fontWeight: 700 }}>Planner</p>
      <h2 style={{ margin: "8px 0 12px", fontSize: "2rem", color: "#102a43" }}>Weekly calendar view</h2>
      <p style={{ maxWidth: "720px", color: "#627d98", lineHeight: 1.7 }}>
        This page will show scheduled time blocks from the backend and later host drag-and-drop editing with a calendar UI.
      </p>

      <div style={{ display: "flex", gap: "12px", marginTop: "18px", alignItems: "center" }}>
        <button
          onClick={handleGenerateSchedule}
          disabled={isGenerating}
          style={{
            border: "none",
            borderRadius: "12px",
            padding: "12px 18px",
            background: isGenerating ? "#9fb3c8" : "#102a43",
            color: "#fff",
            fontWeight: 700,
            cursor: isGenerating ? "default" : "pointer"
          }}
        >
          {isGenerating ? "Generating..." : "Generate Schedule"}
        </button>

        <button
          onClick={() => void loadSchedule()}
          disabled={isLoading}
          style={{
            border: "1px solid #bcccdc",
            borderRadius: "12px",
            padding: "12px 18px",
            background: "#fff",
            color: "#102a43",
            fontWeight: 700,
            cursor: isLoading ? "default" : "pointer"
          }}
        >
          Refresh
        </button>
      </div>

      {weekStart && weekEnd ? (
        <p style={{ marginTop: "18px", color: "#627d98" }}>
          Showing schedule from {new Date(weekStart).toLocaleDateString()} to {new Date(weekEnd).toLocaleDateString()}
        </p>
      ) : null}

      {successMessage ? (
        <div
          style={{
            marginTop: "18px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#e6fffa",
            color: "#0f766e",
            maxWidth: "900px"
          }}
        >
          {successMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div style={{ marginTop: "24px", padding: "24px", borderRadius: "20px", background: "#fff", maxWidth: "900px" }}>
          <p style={{ margin: 0, color: "#627d98" }}>Loading weekly schedule...</p>
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

      {!isLoading && !error && timeBlocks.length === 0 ? (
        <div
          style={{
            marginTop: "24px",
            minHeight: "220px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #d9e2ec 0%, #f0f4f8 100%)",
            display: "grid",
            placeItems: "center",
            maxWidth: "900px"
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: "#102a43" }}>No scheduled blocks yet</div>
            <div style={{ marginTop: "8px", color: "#627d98" }}>
              Generate a schedule from the backend first, then it will appear here.
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && timeBlocks.length > 0 ? (
        <div style={{ marginTop: "24px", display: "grid", gap: "16px", maxWidth: "900px" }}>
          {timeBlocks.map((block) => (
            <article
              key={block.id}
              style={{
                padding: "20px",
                borderRadius: "18px",
                background: "#fff",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#102a43" }}>{block.title}</h3>
                  <p style={{ margin: "8px 0 0", color: "#627d98" }}>
                    {formatDateTime(block.startTime)} {"->"} {formatDateTime(block.endTime)}
                  </p>
                </div>
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: "#ecfdf3",
                    color: "#027a48",
                    fontSize: "0.85rem",
                    fontWeight: 700
                  }}
                >
                  {block.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export { PlannerPage };
