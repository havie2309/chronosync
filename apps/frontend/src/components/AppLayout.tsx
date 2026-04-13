import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const shellStyle = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "240px 1fr",
  background: "linear-gradient(180deg, #f3f4ef 0%, #e7ece8 100%)",
  color: "#1f2933",
  fontFamily: "Segoe UI, sans-serif"
} as const;

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "12px 14px",
  borderRadius: "12px",
  textDecoration: "none",
  color: isActive ? "#102a43" : "#486581",
  background: isActive ? "#d9e2ec" : "transparent",
  fontWeight: 600
});

function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div style={shellStyle}>
      <aside style={{ padding: "28px 20px", borderRight: "1px solid #d9e2ec" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ margin: 0, fontSize: "1.7rem" }}>ChronoSync</h1>
          <p style={{ margin: "8px 0 0", color: "#627d98" }}>Plan messy goals into a real week.</p>
        </div>

        <nav style={{ display: "grid", gap: "10px" }}>
          <NavLink to="/goals" style={navLinkStyle}>
            Goals
          </NavLink>
          <NavLink to="/planner" style={navLinkStyle}>
            Planner
          </NavLink>
          <NavLink to="/tasks" style={navLinkStyle}>
            Tasks
          </NavLink>
          <NavLink to="/metrics" style={navLinkStyle}>
            Metrics
          </NavLink>
          <NavLink to="/health" style={navLinkStyle}>
            Health
          </NavLink>
        </nav>

        <div style={{ marginTop: "32px", padding: "16px", borderRadius: "16px", background: "#fff" }}>
          <div style={{ fontSize: "0.9rem", color: "#627d98" }}>Signed in as</div>
          <div style={{ marginTop: "6px", fontWeight: 700 }}>{user?.name}</div>
          <div style={{ fontSize: "0.9rem", color: "#627d98" }}>{user?.email}</div>
          <button
            onClick={signOut}
            style={{
              marginTop: "14px",
              width: "100%",
              border: "none",
              borderRadius: "10px",
              padding: "10px 12px",
              background: "#102a43",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ padding: "32px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export { AppLayout };
