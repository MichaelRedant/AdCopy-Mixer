import { useCallback, useState } from 'react';
import { ToastMessage } from '../types';

const TOAST_DURATION = 4000;

export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => removeToast(id), TOAST_DURATION);
  }, [removeToast]);

  return { toasts, pushToast, removeToast };
};
