function GoalInputPage() {
  return (
    <section>
      <p style={{ margin: 0, color: "#486581", fontWeight: 700 }}>Goals</p>
      <h2 style={{ margin: "8px 0 12px", fontSize: "2rem", color: "#102a43" }}>Natural-language planning input</h2>
      <p style={{ maxWidth: "720px", color: "#627d98", lineHeight: 1.7 }}>
        This page will collect messy weekly goals, send them to the parse endpoint, and let the user review the structured
        tasks before saving.
      </p>

      <div style={{ marginTop: "24px", padding: "24px", borderRadius: "20px", background: "#fff", maxWidth: "800px" }}>
        <p style={{ marginTop: 0, fontWeight: 700 }}>Coming next</p>
        <p style={{ marginBottom: 0, color: "#627d98" }}>
          We&apos;ll add a text area, parse button, and review table here.
        </p>
      </div>
    </section>
  );
}

export { GoalInputPage };
