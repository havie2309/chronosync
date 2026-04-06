import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateSchedule, getWeekSchedule, resetSchedule, type ScheduleTimeBlock } from "../services/api";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatDayLabel(value: string) {
  return new Date(value).toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTotalScheduledHours(timeBlocks: ScheduleTimeBlock[]) {
  const totalMinutes = timeBlocks.reduce((sum, block) => {
    const start = new Date(block.startTime).getTime();
    const end = new Date(block.endTime).getTime();
    return sum + (end - start) / (1000 * 60);
  }, 0);

  return (totalMinutes / 60).toFixed(1);
}

function PlannerPage() {
  const { user } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<ScheduleTimeBlock[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => toDateInputValue(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sortedTimeBlocks = [...timeBlocks].sort(
    (left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()
  );
  const uniqueScheduledTasks = new Set(timeBlocks.map((block) => block.taskId).filter(Boolean)).size;
  const totalScheduledHours = getTotalScheduledHours(timeBlocks);

  async function loadSchedule(currentUser = user, targetWeekStart = selectedWeekStart) {
    if (!currentUser) {
      setError("You must be signed in to view the planner.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getWeekSchedule(currentUser, targetWeekStart);
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
    void loadSchedule(user, selectedWeekStart);
  }, [selectedWeekStart, user]);

  async function handleGenerateSchedule() {
    if (!user) {
      setError("You must be signed in to generate a schedule.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await generateSchedule(user, selectedWeekStart);
      setSuccessMessage(`Generated ${result.timeBlocks.length} time block(s).`);
      await loadSchedule(user, selectedWeekStart);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to generate schedule");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleResetSchedule() {
    if (!user) {
      setError("You must be signed in to reset the schedule.");
      return;
    }

    setIsResetting(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await resetSchedule(user, selectedWeekStart);
      setSuccessMessage(`Reset ${result.deletedCount} scheduled block(s) for this week.`);
      await loadSchedule(user, selectedWeekStart);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to reset schedule");
    } finally {
      setIsResetting(false);
    }
  }

  async function handleResetAndRegenerate() {
    if (!user) {
      setError("You must be signed in to regenerate the schedule.");
      return;
    }

    setIsGenerating(true);
    setIsResetting(true);
    setError("");
    setSuccessMessage("");

    try {
      await resetSchedule(user, selectedWeekStart);
      const result = await generateSchedule(user, selectedWeekStart);
      setSuccessMessage(`Reset and generated ${result.timeBlocks.length} time block(s).`);
      await loadSchedule(user, selectedWeekStart);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to reset and regenerate schedule");
    } finally {
      setIsGenerating(false);
      setIsResetting(false);
    }
  }

  return (
    <section>
      <p style={{ margin: 0, color: "#486581", fontWeight: 700 }}>Planner</p>
      <h2 style={{ margin: "8px 0 12px", fontSize: "2rem", color: "#102a43" }}>Weekly calendar view</h2>
      <p style={{ maxWidth: "720px", color: "#627d98", lineHeight: 1.7 }}>
        This page will show scheduled time blocks from the backend and later host drag-and-drop editing with a calendar UI.
      </p>

      <div style={{ marginTop: "18px", maxWidth: "280px" }}>
        <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 700 }}>
          Week start
          <input
            type="date"
            value={selectedWeekStart}
            onChange={(event) => setSelectedWeekStart(event.target.value)}
            style={{
              borderRadius: "12px",
              border: "1px solid #cbd2d9",
              padding: "10px 12px",
              fontSize: "0.95rem"
            }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "18px", alignItems: "center" }}>
        <button
          onClick={handleGenerateSchedule}
          disabled={isGenerating || isResetting}
          style={{
            border: "none",
            borderRadius: "12px",
            padding: "12px 18px",
            background: isGenerating || isResetting ? "#9fb3c8" : "#102a43",
            color: "#fff",
            fontWeight: 700,
            cursor: isGenerating || isResetting ? "default" : "pointer"
          }}
        >
          {isGenerating ? "Generating..." : "Generate Schedule"}
        </button>

        <button
          onClick={handleResetSchedule}
          disabled={isResetting || isGenerating}
          style={{
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            padding: "12px 18px",
            background: "#fff5f5",
            color: "#b91c1c",
            fontWeight: 700,
            cursor: isResetting || isGenerating ? "default" : "pointer"
          }}
        >
          {isResetting && !isGenerating ? "Resetting..." : "Reset Week"}
        </button>

        <button
          onClick={handleResetAndRegenerate}
          disabled={isGenerating || isResetting}
          style={{
            border: "1px solid #bcccdc",
            borderRadius: "12px",
            padding: "12px 18px",
            background: "#fff",
            color: "#102a43",
            fontWeight: 700,
            cursor: isGenerating || isResetting ? "default" : "pointer"
          }}
        >
          {isGenerating && isResetting ? "Resetting + Generating..." : "Reset & Regenerate"}
        </button>

        <button
          onClick={() => void loadSchedule(user, selectedWeekStart)}
          disabled={isLoading || isGenerating || isResetting}
          style={{
            border: "1px solid #bcccdc",
            borderRadius: "12px",
            padding: "12px 18px",
            background: "#fff",
            color: "#102a43",
            fontWeight: 700,
            cursor: isLoading || isGenerating || isResetting ? "default" : "pointer"
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

      {!isLoading && !error ? (
        <div
          style={{
            marginTop: "18px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            maxWidth: "900px"
          }}
        >
          <div style={{ padding: "18px", borderRadius: "18px", background: "#fff" }}>
            <div style={{ color: "#627d98", fontSize: "0.9rem" }}>Blocks this week</div>
            <div style={{ marginTop: "8px", fontSize: "1.8rem", fontWeight: 800, color: "#102a43" }}>{timeBlocks.length}</div>
          </div>
          <div style={{ padding: "18px", borderRadius: "18px", background: "#fff" }}>
            <div style={{ color: "#627d98", fontSize: "0.9rem" }}>Scheduled hours</div>
            <div style={{ marginTop: "8px", fontSize: "1.8rem", fontWeight: 800, color: "#027a48" }}>{totalScheduledHours}</div>
          </div>
          <div style={{ padding: "18px", borderRadius: "18px", background: "#fff" }}>
            <div style={{ color: "#627d98", fontSize: "0.9rem" }}>Unique tasks planned</div>
            <div style={{ marginTop: "8px", fontSize: "1.8rem", fontWeight: 800, color: "#b45309" }}>{uniqueScheduledTasks}</div>
          </div>
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
            minHeight: "260px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #d9e2ec 0%, #f0f4f8 100%)",
            padding: "28px",
            maxWidth: "900px"
          }}
        >
          <div style={{ maxWidth: "620px" }}>
            <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "#102a43" }}>No scheduled blocks yet</div>
            <p style={{ marginTop: "10px", marginBottom: "18px", color: "#486581", lineHeight: 1.7 }}>
              This week is empty right now. ChronoSync can only generate blocks from tasks you&apos;ve already reviewed and
              saved.
            </p>

            <div style={{ display: "grid", gap: "10px", color: "#334e68" }}>
              <div>1. Go to the Goals page and parse your messy weekly plan.</div>
              <div>2. Review the parsed tasks and save them.</div>
              <div>3. Come back here, pick the week you want, and click `Generate Schedule`.</div>
            </div>

            <Link
              to="/goals"
              style={{
                display: "inline-block",
                marginTop: "18px",
                padding: "12px 18px",
                borderRadius: "12px",
                background: "#102a43",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700
              }}
            >
              Go To Goals
            </Link>

            <div
              style={{
                marginTop: "18px",
                padding: "16px 18px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.78)",
                color: "#486581"
              }}
            >
              Tip: use `Reset & Regenerate` after editing tasks or changing the selected week, so the planner refreshes from
              a clean state.
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && timeBlocks.length > 0 ? (
        <div style={{ marginTop: "24px", display: "grid", gap: "16px", maxWidth: "900px" }}>
          {sortedTimeBlocks.map((block) => (
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
                  <div style={{ marginTop: "8px", color: "#486581", fontWeight: 700 }}>{formatDayLabel(block.startTime)}</div>
                  <p style={{ margin: "8px 0 0", color: "#627d98" }}>
                    {formatTime(block.startTime)} {"->"} {formatTime(block.endTime)}
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
