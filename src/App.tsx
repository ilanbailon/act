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
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/Auth';
import TodayPage from './pages/Today';
import WeekPage from './pages/Week';
import AllTasksPage from './pages/AllTasks';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';

const App = () => {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
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
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-100">
        <Routes>
          <Route path="/auth" element={session ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route
            path="/"
            element={
              session ? (
                <Layout onSignOut={signOut}>
                  <TodayPage />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/week"
            element={
              session ? (
                <Layout onSignOut={signOut}>
                  <WeekPage />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/tasks"
            element={
              session ? (
                <Layout onSignOut={signOut}>
                  <AllTasksPage />
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={session ? '/' : '/auth'} replace />} />
        </Routes>
        <ToastContainer />
      </div>
    </ToastProvider>
  );
};

const Layout: React.FC<{ children: React.ReactNode; onSignOut: () => Promise<void> }> = ({
  children,
  onSignOut,
}) => {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
        <h1 className="text-xl font-semibold text-slate-800">Task Planner</h1>
        <nav className="flex items-center gap-3 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded px-3 py-2 hover:bg-slate-100 ${isActive ? 'bg-slate-200 text-slate-900' : ''}`
            }
          >
            Hoy
          </NavLink>
          <NavLink
            to="/week"
            className={({ isActive }) =>
              `rounded px-3 py-2 hover:bg-slate-100 ${isActive ? 'bg-slate-200 text-slate-900' : ''}`
            }
          >
            Semana
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `rounded px-3 py-2 hover:bg-slate-100 ${isActive ? 'bg-slate-200 text-slate-900' : ''}`
            }
          >
            Todas
          </NavLink>
          <button
            type="button"
            className="rounded bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
            onClick={() => onSignOut()}
          >
            Salir
          </button>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default App;
