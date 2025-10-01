import { useToast } from '../context/ToastContext';

export const ToastContainer = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded border bg-white px-4 py-2 shadow ${
            toast.type === 'error'
              ? 'border-red-400 text-red-700'
              : toast.type === 'success'
              ? 'border-emerald-400 text-emerald-700'
              : 'border-blue-400 text-blue-700'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <span>{toast.message}</span>
            <button
              type="button"
              className="text-xs font-semibold"
              onClick={() => dismissToast(toast.id)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
