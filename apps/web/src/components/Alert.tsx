import { useEffect } from 'react';

interface AlertProps {
  message: string;
  type?: 'error' | 'success';
  onClose?: () => void;
  autoHideMs?: number;
}

export default function Alert({ message, type = 'error', onClose, autoHideMs = 4000 }: AlertProps) {
  useEffect(() => {
    if (!onClose || !message) return;
    const timer = window.setTimeout(onClose, autoHideMs);
    return () => window.clearTimeout(timer);
  }, [autoHideMs, message, onClose]);

  return (
    <div className={`alert alert-${type} alert-floating`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" type="button" onClick={onClose} aria-label="Cerrar alerta">
          x
        </button>
      )}
    </div>
  );
}
