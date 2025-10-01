import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";

const AuthPage = () => {
  const { session, signInWithPassword, signUpWithPassword, sendMagicLink, loading } = useAuth();
  const { push } = useToast();
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (session) {
    return <Navigate to="/today" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (mode === "signin") {
        await signInWithPassword(email, password);
        push({ title: "Sesión iniciada", type: "success" });
      } else if (mode === "signup") {
        await signUpWithPassword(email, password);
        push({ title: "Revisa tu correo para confirmar la cuenta" });
      } else {
        await sendMagicLink(email);
        push({ title: "Enlace mágico enviado", description: "Revisa tu bandeja" });
      }
    } catch (error) {
      console.error(error);
      push({ title: "No se pudo autenticar", type: "error" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-semibold text-white">ACT Planner</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm ${
                mode === "signin"
                  ? "bg-primary/20 text-primary"
                  : "border border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setMode("signin")}
            >
              Ingresar
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm ${
                mode === "signup"
                  ? "bg-primary/20 text-primary"
                  : "border border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setMode("signup")}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm ${
                mode === "magic"
                  ? "bg-primary/20 text-primary"
                  : "border border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setMode("magic")}
            >
              Magic link
            </button>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Correo</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
              type="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {mode !== "magic" ? (
            <div>
              <label className="mb-1 block text-sm text-slate-300">Contraseña</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-primary focus:outline-none"
                type="password"
                value={password}
                required
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/30 disabled:opacity-50"
          >
            {loading ? "Procesando..." : mode === "signin" ? "Entrar" : mode === "signup" ? "Registrarme" : "Enviar enlace"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
