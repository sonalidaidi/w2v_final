import React from 'react';
import {
  FPUNotification,
  getFPUNotifications,
  markFPUNotificationAsRead,
  markAllFPUNotificationsAsRead,
} from '../../services/fpuStorage';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCheck,
} from 'lucide-react';

interface FPUNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const FPUNotificationModal: React.FC<FPUNotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const notifications = getFPUNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white border border-[#0C2D21]/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#0C2D21]/10 flex items-center justify-between bg-[#FAF8F3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0C2D21] text-white flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase">
                FPU NOTIFICATIONS
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">
                {unreadCount} unread alerts
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  markAllFPUNotificationsAsRead();
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-[#059669] hover:underline cursor-pointer flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => {
              const isCrit = n.severity === 'CRITICAL';
              const isWarn = n.severity === 'WARNING';

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markFPUNotificationAsRead(n.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    !n.isRead
                      ? 'bg-[#FAF8F3] border-[#0C2D21]/20 shadow-2xs'
                      : 'bg-white border-stone-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          isCrit
                            ? 'bg-red-100 text-red-800'
                            : isWarn
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {n.type.replace('_', ' ')}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-[#0C2D21]">
                    {n.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#0C2D21]/10 bg-[#FAF8F3] text-center text-[11px] text-stone-500">
          W2V Event Dispatch System · Real-time operational alerts
        </div>

      </div>
    </div>
  );
};
