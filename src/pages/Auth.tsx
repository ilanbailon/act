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
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthPage = () => {
  const { signInWithEmail, signUpWithEmail, sendMagicLink } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!email) {
        throw new Error('Ingresa un correo');
      }
      if (mode !== 'magic' && password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (mode === 'signin') {
        await signInWithEmail(email, password);
        pushToast({ type: 'success', message: 'Inicio de sesión exitoso' });
        navigate('/');
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password);
        pushToast({ type: 'success', message: 'Revisa tu correo para confirmar tu cuenta' });
      } else {
        await sendMagicLink(email);
        pushToast({ type: 'info', message: 'Enlace mágico enviado, revisa tu correo' });
      }
    } catch (error) {
      console.error(error);
      pushToast({ type: 'error', message: error instanceof Error ? error.message : 'Error' });
    } finally {
      setLoading(false);
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

    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">
          {mode === 'signin' && 'Inicia sesión'}
          {mode === 'signup' && 'Crea una cuenta'}
          {mode === 'magic' && 'Recibe un enlace mágico'}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            Correo
            <input
              className="rounded border border-slate-300 px-3 py-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {mode !== 'magic' && (
            <label className="flex flex-col gap-1 text-sm">
              Contraseña
              <input
                className="rounded border border-slate-300 px-3 py-2"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
          )}
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Continuar'}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-2 text-sm text-slate-600">
          {mode !== 'signin' && (
            <button className="text-left text-blue-600" onClick={() => setMode('signin')}>
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
          {mode !== 'signup' && (
            <button className="text-left text-blue-600" onClick={() => setMode('signup')}>
              ¿Nuevo aquí? Regístrate
            </button>
          )}
          {mode !== 'magic' && (
            <button className="text-left text-blue-600" onClick={() => setMode('magic')}>
              Prefiero un enlace mágico
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
