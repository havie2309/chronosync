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

  function updateParsedTask(index: number, updates: Partial<ParsedTask>) {
    setParsedTasks((currentTasks) =>
      currentTasks.map((task, taskIndex) => (taskIndex === index ? { ...task, ...updates } : task))
    );
  }

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
                  <h3 style={{ margin: 0, color: "#102a43" }}>Task {index + 1}</h3>
                  <p style={{ margin: "8px 0 0", color: "#627d98" }}>Review and edit this task before saving it.</p>
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

              <div
                style={{
                  marginTop: "18px",
                  display: "grid",
                  gap: "14px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
                }}
              >
                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Title
                  <input
                    value={task.title}
                    onChange={(event) => updateParsedTask(index, { title: event.target.value })}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem"
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Duration (min)
                  <input
                    type="number"
                    min={1}
                    value={task.durationMinutes}
                    onChange={(event) =>
                      updateParsedTask(index, { durationMinutes: Number(event.target.value) || task.durationMinutes })
                    }
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem"
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Priority
                  <select
                    value={task.priority}
                    onChange={(event) => updateParsedTask(index, { priority: Number(event.target.value) })}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem"
                    }}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Status
                  <select
                    value={task.status}
                    onChange={(event) => updateParsedTask(index, { status: event.target.value })}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem"
                    }}
                  >
                    <option value="pending">pending</option>
                    <option value="in_progress">in_progress</option>
                    <option value="scheduled">scheduled</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Deadline
                  <input
                    value={task.deadline ?? ""}
                    onChange={(event) => updateParsedTask(index, { deadline: event.target.value || null })}
                    placeholder="YYYY-MM-DD or leave blank"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem"
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Recurrence
                  <input
                    value={task.recurrence ?? ""}
                    onChange={(event) => updateParsedTask(index, { recurrence: event.target.value || null })}
                    placeholder="e.g. 3_times_this_week"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem"
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Preferred window
                  <input
                    value={task.preferredTimeWindow ?? ""}
                    onChange={(event) => updateParsedTask(index, { preferredTimeWindow: event.target.value || null })}
                    placeholder="morning / afternoon / evening"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem"
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Estimated effort
                  <input
                    value={task.estimatedEffort ?? ""}
                    onChange={(event) => updateParsedTask(index, { estimatedEffort: event.target.value || null })}
                    placeholder="low / medium / high"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem"
                    }}
                  />
                </label>
              </div>

              <div style={{ marginTop: "14px", display: "grid", gap: "8px" }}>
                <label style={{ display: "grid", gap: "8px", color: "#486581", fontWeight: 600 }}>
                  Description
                  <textarea
                    value={task.description ?? ""}
                    onChange={(event) => updateParsedTask(index, { description: event.target.value || undefined })}
                    rows={3}
                    placeholder="Optional details"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #cbd2d9",
                      padding: "10px 12px",
                      fontSize: "0.95rem",
                      resize: "vertical"
                    }}
                  />
                </label>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export { GoalInputPage };
