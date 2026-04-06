import { useEffect, useState } from "react";
import { getMetricsSummary, type MetricsSummaryResponse } from "../services/api";
import { useAuth } from "../context/AuthContext";

const cardGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginTop: "24px"
} as const;

const cardStyle = {
  background: "#fff",
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)"
} as const;

function formatLastRun(lastSchedulerRunAt: string | null) {
  if (!lastSchedulerRunAt) {
    return "No scheduler run yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(lastSchedulerRunAt));
}

function MetricsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getMetricsSummary(user);
        setMetrics(response);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load metrics";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadMetrics();
  }, [user]);

  return (
    <section>
      <div>
        <div style={{ color: "#486581", fontWeight: 700, fontSize: "1.05rem" }}>Metrics</div>
        <h1 style={{ margin: "14px 0 0", fontSize: "3.4rem", lineHeight: 1.05, color: "#102a43" }}>
          System overview
        </h1>
        <p style={{ margin: "18px 0 0", maxWidth: "900px", color: "#627d98", fontSize: "1.1rem", lineHeight: 1.8 }}>
          This page surfaces the backend summary metrics so you can quickly see how much work has been captured,
          scheduled, and processed through the planner.
        </p>
      </div>

      {isLoading ? (
        <div style={{ ...cardStyle, marginTop: "24px", color: "#627d98" }}>Loading metrics...</div>
      ) : null}

      {error ? (
        <div
          style={{
            ...cardStyle,
            marginTop: "24px",
            background: "#fff1f1",
            color: "#a61b1b"
          }}
        >
          {error}
        </div>
      ) : null}

      {!isLoading && !error && metrics ? (
        <>
          <div style={cardGridStyle}>
            <div style={cardStyle}>
              <div style={{ color: "#627d98", fontWeight: 600 }}>Total tasks</div>
              <div style={{ marginTop: "10px", fontSize: "2.3rem", fontWeight: 800, color: "#102a43" }}>
                {metrics.tasks.total}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: "#627d98", fontWeight: 600 }}>Pending tasks</div>
              <div style={{ marginTop: "10px", fontSize: "2.3rem", fontWeight: 800, color: "#d97706" }}>
                {metrics.tasks.pending}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: "#627d98", fontWeight: 600 }}>In progress</div>
              <div style={{ marginTop: "10px", fontSize: "2.3rem", fontWeight: 800, color: "#2563eb" }}>
                {metrics.tasks.inProgress}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ color: "#627d98", fontWeight: 600 }}>Scheduled tasks</div>
              <div style={{ marginTop: "10px", fontSize: "2.3rem", fontWeight: 800, color: "#2f855a" }}>
                {metrics.tasks.scheduled}
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginTop: "24px" }}>
            <h2 style={{ margin: 0, color: "#102a43", fontSize: "1.5rem" }}>Scheduling health</h2>

            <div style={{ ...cardGridStyle, marginTop: "18px" }}>
              <div>
                <div style={{ color: "#627d98", fontWeight: 600 }}>Total time blocks</div>
                <div style={{ marginTop: "8px", fontSize: "2rem", fontWeight: 800, color: "#102a43" }}>
                  {metrics.schedule.totalTimeBlocks}
                </div>
              </div>

              <div>
                <div style={{ color: "#627d98", fontWeight: 600 }}>Current week blocks</div>
                <div style={{ marginTop: "8px", fontSize: "2rem", fontWeight: 800, color: "#102a43" }}>
                  {metrics.schedule.currentWeekTimeBlocks}
                </div>
              </div>

              <div>
                <div style={{ color: "#627d98", fontWeight: 600 }}>Scheduler runs</div>
                <div style={{ marginTop: "8px", fontSize: "2rem", fontWeight: 800, color: "#102a43" }}>
                  {metrics.schedule.schedulerRuns}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "16px 18px",
                borderRadius: "16px",
                background: "#f8fafc",
                color: "#486581"
              }}
            >
              <strong style={{ color: "#102a43" }}>Last scheduler run:</strong> {formatLastRun(metrics.schedule.lastSchedulerRunAt)}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

export { MetricsPage };
