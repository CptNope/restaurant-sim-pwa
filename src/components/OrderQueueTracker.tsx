import React from 'react';
import { X, Receipt, Clock, ChefHat, CheckCircle2, Flame } from 'lucide-react';
import { simulation } from '../simulation/RestaurantSimulation';
import { OrderTicket } from '../types/restaurant';

interface OrderQueueTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderQueueTracker: React.FC<OrderQueueTrackerProps> = ({ isOpen, onClose }) => {
  const [tickets, setTickets] = React.useState<OrderTicket[]>([...simulation.tickets]);

  React.useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTickets([...simulation.tickets]);
    }, 200);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const activeTickets = tickets.filter((t) => t.status !== 'served' && t.status !== 'cancelled');

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-surface/95 backdrop-blur-md border-l border-slate-700/80 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Kitchen Orders</h3>
            <span className="text-[10px] text-slate-400">{activeTickets.length} Active Tickets in Queue</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tickets List */}
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto bg-slate-950/40">
        {activeTickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600" />
            <span className="text-xs font-semibold">Kitchen queue clear! No pending tickets.</span>
          </div>
        ) : (
          activeTickets.map((ticket) => {
            const statusConfig = {
              ordered: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Queued for Chef' },
              cooking: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Cooking on Station' },
              cooked_ready: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Ready on Pass Table' },
              served: { bg: 'bg-slate-800 border-slate-700', text: 'text-slate-400', label: 'Served' },
              cancelled: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Cancelled' },
            }[ticket.status];

            return (
              <div
                key={ticket.id}
                className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition ${statusConfig.bg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ticket.menuItem.iconEmoji}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{ticket.menuItem.name}</span>
                      <span className="text-[10px] text-slate-400">Guest: {ticket.guestName}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">${ticket.menuItem.sellPrice}</span>
                </div>

                {/* Progress bar for cooking */}
                {ticket.status === 'cooking' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-semibold text-blue-300">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" /> Sizzling...
                      </span>
                      <span>{Math.round(ticket.prepProgress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-amber-500 transition-all duration-200"
                        style={{ width: `${ticket.prepProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                  <span className={`font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                  <span className="text-slate-400 font-mono">
                    Station: {ticket.menuItem.prepStation.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
