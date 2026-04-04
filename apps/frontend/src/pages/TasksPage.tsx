function TasksPage() {
  return (
    <section>
      <p style={{ margin: 0, color: "#486581", fontWeight: 700 }}>Tasks</p>
      <h2 style={{ margin: "8px 0 12px", fontSize: "2rem", color: "#102a43" }}>Task review and editing</h2>
      <p style={{ maxWidth: "720px", color: "#627d98", lineHeight: 1.7 }}>
        This page will list parsed and saved tasks, show status, and later support edit and delete actions from the UI.
      </p>

      <div style={{ marginTop: "24px", padding: "24px", borderRadius: "20px", background: "#fff", maxWidth: "800px" }}>
        <p style={{ marginTop: 0, fontWeight: 700 }}>Task list placeholder</p>
        <p style={{ marginBottom: 0, color: "#627d98" }}>
          We&apos;ll connect this to `GET /api/tasks` and render real task data in the next frontend steps.
        </p>
      </div>
    </section>
  );
}

export { TasksPage };
