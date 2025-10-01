import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";
import AuthPage from "./pages/Auth";
import TodayPage from "./pages/Today";
import WeekPage from "./pages/Week";
import AllTasksPage from "./pages/AllTasks";
import { useEffect } from "react";
import { Header } from "./components/Header";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const App = () => {
  const { session } = useAuth();

  useEffect(() => {
    if (session && window.location.pathname === "/auth") {
      window.history.replaceState(null, "", "/today");
    }
  }, [session]);

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Header />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="week" element={<WeekPage />} />
        <Route path="all" element={<AllTasksPage />} />
      </Route>
      <Route path="*" element={<Navigate to={session ? "/today" : "/auth"} replace />} />
    </Routes>
  );
};

export default App;
