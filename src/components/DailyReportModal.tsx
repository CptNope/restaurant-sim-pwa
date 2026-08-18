import React from 'react';
import { X, Star, DollarSign, Award, ThumbsUp, TrendingUp, Users, Heart } from 'lucide-react';
import { simulation } from '../simulation/RestaurantSimulation';
import { GuestReview } from '../types/restaurant';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ isOpen, onClose }) => {
  const [reviews, setReviews] = React.useState<GuestReview[]>([...simulation.reviews]);
  const [stats, setStats] = React.useState(simulation.stats);

  React.useEffect(() => {
    if (!isOpen) return;
    setReviews([...simulation.reviews]);
    setStats({ ...simulation.stats });
  }, [isOpen]);

  if (!isOpen) return null;

  const netProfit = +(stats.dailyRevenue - stats.dailyExpenses).toFixed(2);
  const bestStaff = [...simulation.staff].sort((a, b) => b.tablesServedCount - a.tablesServedCount)[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Daily Ledger & Guest Reviews</h2>
              <p className="text-xs text-slate-400">Yelp critic reviews, revenue analytics, and employee awards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto bg-slate-950/40">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Reputation Rating */}
            <div className="bg-slate-900/80 border border-amber-500/30 p-4 rounded-2xl flex flex-col gap-1 shadow-glow">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Restaurant Rating</span>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-black text-amber-200 font-mono">{stats.reputationStars.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-amber-400 font-semibold">{reviews.length} Verified Reviews</span>
            </div>

            {/* Daily Net Profit */}
            <div className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-2xl flex flex-col gap-1 shadow-glow-green">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today Net Profit</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <span className={`text-2xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                  ${netProfit}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Rev: ${stats.dailyRevenue.toFixed(2)} | Cost: ${stats.dailyExpenses.toFixed(2)}</span>
            </div>

            {/* Customers Served */}
            <div className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Turnover Volume</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-6 h-6 text-blue-400" />
                <span className="text-2xl font-black text-blue-200 font-mono">{stats.dailyCustomersServed}</span>
              </div>
              <span className="text-[10px] text-red-400">Lost to Wait: {stats.dailyCustomersLost}</span>
            </div>

            {/* Staff MVP */}
            <div className="bg-slate-900/80 border border-purple-500/30 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Shift MVP</span>
              {bestStaff ? (
                <>
                  <span className="text-sm font-bold text-white truncate">{bestStaff.name}</span>
                  <span className="text-[10px] text-slate-400">
                    Served {bestStaff.tablesServedCount} tables (${bestStaff.tipsEarned.toFixed(2)} tips)
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-400">Evaluating staff...</span>
              )}
            </div>
          </div>

          {/* Guest Reviews Feed */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Recent Guest Reviews & Critic Feedback
            </span>

            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
              {reviews.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No reviews recorded yet today. Guests will review as they finish meals!</span>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{rev.guestName}</span>
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < rev.stars ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {rev.tipAmount > 0 ? `+$${rev.tipAmount.toFixed(2)} Tip` : 'No Tip'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                    {rev.foodServed && (
                      <span className="text-[10px] text-slate-400 font-mono">Ordered: {rev.foodServed}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
