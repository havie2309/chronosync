import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/goals", { replace: true });
    }
  }, [navigate, user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(circle at top, #d9f99d 0%, #f7fee7 35%, #ecfeff 100%)",
        fontFamily: "Segoe UI, sans-serif"
      }}
    >
      <div
        style={{
          width: "min(460px, 92vw)",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)"
        }}
      >
        <p style={{ margin: 0, color: "#486581", fontWeight: 700 }}>ChronoSync</p>
        <h1 style={{ margin: "10px 0 12px", fontSize: "2.2rem", color: "#102a43" }}>Turn messy plans into a real week.</h1>
        <p style={{ margin: 0, color: "#627d98", lineHeight: 1.6 }}>
          This is a temporary login shell for development. We&apos;ll swap it with Google sign-in later.
        </p>

        <button
          onClick={signIn}
          style={{
            marginTop: "24px",
            width: "100%",
            border: "none",
            borderRadius: "14px",
            padding: "14px 16px",
            background: "#102a43",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Continue as Demo User
        </button>
      </div>
    </div>
  );
}

export { LoginPage };
