import React from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastAlert {
  id: string;
  title: string;
  message: string;
  taskId?: string;
  timestamp: string;
}

interface NotificationToastProps {
  toasts: ToastAlert[];
  onDismiss: (id: string) => void;
  onSelectTask?: (taskId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
  onSelectTask,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-auto p-4 rounded-2xl bg-slate-900 text-white border border-indigo-500/40 shadow-2xl backdrop-blur-md flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mt-0.5">
              <Bell className="w-5 h-5 animate-bounce text-indigo-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-0.5">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {toast.message}
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                {toast.timestamp}
              </span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
