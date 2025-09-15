import { Toast } from '@/components/ui/toast';
import { ToastData } from '@/hooks/use-toast';

interface ToastContainerProps {
  toasts: ToastData[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          duration={toast.duration}
          visible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}