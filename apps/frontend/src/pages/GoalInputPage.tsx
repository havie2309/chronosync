import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseTasks, saveTasks, type ParsedTask } from "../services/api";

const samplePrompt = "study physics 3 times this week, gym on 2 evenings, finish math assignment before Friday";

function GoalInputPage() {
  const { user } = useAuth();
  const [text, setText] = useState(samplePrompt);
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [parserMode, setParserMode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleParse() {
    if (!user) {
      setError("You must be signed in to parse tasks.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await parseTasks(text, user);
      setParsedTasks(result.tasks);
      setParserMode(result.parserMode);
    } catch (nextError) {
      setParsedTasks([]);
      setParserMode("");
      setError(nextError instanceof Error ? nextError.message : "Failed to parse tasks");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveTasks() {
    if (!user) {
      setError("You must be signed in to save tasks.");
      return;
    }

    if (parsedTasks.length === 0) {
      setError("Parse tasks first before saving.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await saveTasks(parsedTasks, user);
      setSuccessMessage(`Saved ${result.tasks.length} task(s) to your account.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save tasks");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section>
      <p style={{ margin: 0, color: "#486581", fontWeight: 700 }}>Goals</p>
      <h2 style={{ margin: "8px 0 12px", fontSize: "2rem", color: "#102a43" }}>Natural-language planning input</h2>
      <p style={{ maxWidth: "720px", color: "#627d98", lineHeight: 1.7 }}>
        This page will collect messy weekly goals, send them to the parse endpoint, and let the user review the structured
        tasks before saving.
      </p>

      <div style={{ marginTop: "24px", padding: "24px", borderRadius: "20px", background: "#fff", maxWidth: "900px" }}>
        <label htmlFor="goal-input" style={{ display: "block", fontWeight: 700, marginBottom: "12px" }}>
          Weekly goals
        </label>
        <textarea
          id="goal-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          style={{
            width: "100%",
            borderRadius: "16px",
            border: "1px solid #cbd2d9",
            padding: "14px 16px",
            fontSize: "1rem",
            lineHeight: 1.6,
            resize: "vertical",
            boxSizing: "border-box"
          }}
        />

        <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" }}>
          <button
            onClick={handleParse}
            disabled={isLoading}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "12px 18px",
              background: isLoading ? "#9fb3c8" : "#102a43",
              color: "#fff",
              fontWeight: 700,
              cursor: isLoading ? "default" : "pointer"
            }}
          >
            {isLoading ? "Parsing..." : "Parse Goals"}
          </button>

          <button
            onClick={handleSaveTasks}
            disabled={isSaving || parsedTasks.length === 0}
            style={{
              border: "1px solid #bcccdc",
              borderRadius: "12px",
              padding: "12px 18px",
              background: isSaving || parsedTasks.length === 0 ? "#f0f4f8" : "#fff",
              color: "#102a43",
              fontWeight: 700,
              cursor: isSaving || parsedTasks.length === 0 ? "default" : "pointer"
            }}
          >
            {isSaving ? "Saving..." : "Save Reviewed Tasks"}
          </button>

          {parserMode ? <span style={{ color: "#627d98" }}>Parser mode: {parserMode}</span> : null}
        </div>

        {error ? (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#fde8e8",
              color: "#9b1c1c"
            }}
          >
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#e6fffa",
              color: "#0f766e"
            }}
          >
            {successMessage}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: "24px", display: "grid", gap: "16px", maxWidth: "900px" }}>
        {parsedTasks.length === 0 ? (
          <div style={{ padding: "24px", borderRadius: "20px", background: "#fff", color: "#627d98" }}>
            Parsed tasks will appear here after you run the parser.
          </div>
        ) : (
          parsedTasks.map((task, index) => (
            <article
              key={`${task.title}-${index}`}
              style={{
                padding: "20px",
                borderRadius: "18px",
                background: "#fff",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#102a43" }}>{task.title}</h3>
                  <p style={{ margin: "8px 0 0", color: "#627d98" }}>
                    Duration: {task.durationMinutes} min | Priority: {task.priority} | Status: {task.status}
                  </p>
                </div>
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: "#e6fffa",
                    color: "#0f766e",
                    fontSize: "0.85rem",
                    fontWeight: 700
                  }}
                >
                  Review
                </span>
              </div>

              <div style={{ marginTop: "14px", display: "grid", gap: "8px", color: "#486581" }}>
                <div>Deadline: {task.deadline ?? "None"}</div>
                <div>Recurrence: {task.recurrence ?? "None"}</div>
                <div>Preferred window: {task.preferredTimeWindow ?? "None"}</div>
                <div>Estimated effort: {task.estimatedEffort ?? "None"}</div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export { GoalInputPage };
