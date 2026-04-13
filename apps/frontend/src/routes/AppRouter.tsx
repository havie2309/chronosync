import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { GoalInputPage } from "../pages/GoalInputPage";
import { HealthPage } from "../pages/HealthPage";
import { LoginPage } from "../pages/LoginPage";
import { MetricsPage } from "../pages/MetricsPage";
import { PlannerPage } from "../pages/PlannerPage";
import { TasksPage } from "../pages/TasksPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/goals" replace />} />
            <Route path="/goals" element={<GoalInputPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/health" element={<HealthPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export { AppRouter };
