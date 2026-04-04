function PlannerPage() {
  return (
    <section>
      <p style={{ margin: 0, color: "#486581", fontWeight: 700 }}>Planner</p>
      <h2 style={{ margin: "8px 0 12px", fontSize: "2rem", color: "#102a43" }}>Weekly calendar view</h2>
      <p style={{ maxWidth: "720px", color: "#627d98", lineHeight: 1.7 }}>
        This page will show scheduled time blocks from the backend and later host drag-and-drop editing with a calendar UI.
      </p>

      <div
        style={{
          marginTop: "24px",
          minHeight: "360px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, #d9e2ec 0%, #f0f4f8 100%)",
          display: "grid",
          placeItems: "center"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, color: "#102a43" }}>Calendar UI placeholder</div>
          <div style={{ marginTop: "8px", color: "#627d98" }}>Next we&apos;ll wire schedule fetches into this screen.</div>
        </div>
      </div>
    </section>
  );
}

export { PlannerPage };
