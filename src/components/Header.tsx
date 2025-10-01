import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-primary/20 text-primary" : "text-slate-300 hover:text-white"
  }`;

export const Header = () => {
  const { signOut, session } = useAuth();
  const { push } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      push({ title: "Sesión cerrada" });
    } catch (error) {
      push({ title: "No se pudo cerrar sesión", type: "error" });
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary/80">ACT Planner</p>
            <p className="text-sm text-slate-400">
              Hola {session?.user.email?.split("@")[0] ?? ""}
            </p>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink to="/today" className={navLinkClass}>
              Today
            </NavLink>
            <NavLink to="/week" className={navLinkClass}>
              Week
            </NavLink>
            <NavLink to="/all" className={navLinkClass}>
              All Tasks
            </NavLink>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
