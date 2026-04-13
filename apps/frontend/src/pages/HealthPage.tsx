import { useEffect, useState } from "react";
import { getHealthDetails, type HealthDetailsResponse } from "../services/api";

const cardStyle = {
  background: "#fff",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)"
} as const;

function getStatusStyle(status: "ok" | "error") {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 12px",
    background: status === "ok" ? "#e8f7ee" : "#fff1f1",
    color: status === "ok" ? "#2f855a" : "#a61b1b",
    fontWeight: 800
  } as const;
}

function HealthPage() {
  const [health, setHealth] = useState<HealthDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);

  async function loadHealth() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getHealthDetails();
      setHealth(response);
      setLastCheckedAt(new Date());
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load health status";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadHealth();
  }, []);

  const lastCheckedLabel = lastCheckedAt
    ? new Intl.DateTimeFormat(undefined, { timeStyle: "medium" }).format(lastCheckedAt)
    : "Not checked yet";

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "24px", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#486581", fontWeight: 700, fontSize: "1.05rem" }}>Health</div>
          <h1 style={{ margin: "14px 0 0", fontSize: "3.4rem", lineHeight: 1.05, color: "#102a43" }}>
            Service status
          </h1>
          <p style={{ margin: "18px 0 0", maxWidth: "850px", color: "#627d98", fontSize: "1.1rem", lineHeight: 1.8 }}>
            Check whether the ChronoSync API is reachable and whether the backend can connect to PostgreSQL.
          </p>
        </div>

        <div style={{ minWidth: "180px", textAlign: "right" }}>
          <button
            onClick={() => void loadHealth()}
            disabled={isLoading}
            style={{
              border: "none",
              borderRadius: "14px",
              padding: "12px 18px",
              background: isLoading ? "#9fb3c8" : "#102a43",
              color: "#fff",
              fontWeight: 800,
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Checking..." : "Check Health"}
          </button>
          <div style={{ marginTop: "10px", color: "#627d98", fontSize: "0.9rem" }}>
            Last checked: {lastCheckedLabel}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ ...cardStyle, marginTop: "24px", color: "#627d98" }}>Checking service health...</div>
      ) : null}

      {error ? (
        <div style={{ ...cardStyle, marginTop: "24px", background: "#fff1f1", color: "#a61b1b" }}>{error}</div>
      ) : null}

      {!isLoading && !error && health ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", marginTop: "24px" }}>
          <div style={cardStyle}>
            <div style={{ color: "#627d98", fontWeight: 600 }}>API service</div>
            <h2 style={{ margin: "10px 0 18px", color: "#102a43" }}>{health.service}</h2>
            <span style={getStatusStyle(health.checks.api)}>{health.checks.api.toUpperCase()}</span>
          </div>

          <div style={cardStyle}>
            <div style={{ color: "#627d98", fontWeight: 600 }}>PostgreSQL connection</div>
            <h2 style={{ margin: "10px 0 18px", color: "#102a43" }}>Database</h2>
            <span style={getStatusStyle(health.checks.database)}>{health.checks.database.toUpperCase()}</span>
          </div>

          <div style={{ ...cardStyle, background: health.ok ? "#f0fff4" : "#fff5f5" }}>
            <div style={{ color: "#627d98", fontWeight: 600 }}>Overall status</div>
            <h2 style={{ margin: "10px 0 18px", color: "#102a43" }}>{health.ok ? "Operational" : "Needs attention"}</h2>
            <p style={{ margin: 0, color: "#486581", lineHeight: 1.7 }}>
              {health.ok
                ? "The API and database checks are passing."
                : "One or more health checks failed. Check the backend terminal for details."}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export { HealthPage };
