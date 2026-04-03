import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { BillingPlanCode } from '../../types/billing.types';

interface PlanCardProps {
    planCode: Exclude<BillingPlanCode, 'free'>;
    title: string;
    price: string;
    cadence: string;
    badge?: string;
    summary: string;
    features: string[];
    checkoutLabel?: string;
    isSelected?: boolean;
    isLoading?: boolean;
    onSelect: (planCode: Exclude<BillingPlanCode, 'free'>) => void;
}

export default function PlanCard({
    planCode,
    title,
    price,
    cadence,
    badge,
    summary,
    features,
    checkoutLabel = 'Submit tx hash',
    isSelected = false,
    isLoading = false,
    onSelect,
}: PlanCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`group relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition ${
                isSelected
                    ? 'border-primary/35 bg-[linear-gradient(180deg,rgba(20,27,38,0.98),rgba(9,12,19,1))]'
                    : 'border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(10,13,24,0.98))]'
            }`}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/90 to-transparent" />
            <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-primary/12 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(7,198,239,0.08),transparent_28%)] opacity-80" />

            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-secondary/80">Hosted By Binance Pay</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">{title}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {badge ? (
                        <span className="rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                            {badge}
                        </span>
                    ) : null}
                    {isSelected ? (
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            Selected
                        </span>
                    ) : null}
                </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-300">{summary}</p>

            <div className="mt-6 flex items-end gap-2">
                <span className="font-serif text-5xl leading-none text-white">{price}</span>
                <span className="pb-1 text-sm uppercase tracking-[0.18em] text-slate-400">{cadence}</span>
            </div>

            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                one-time payment
            </div>

            <div className="mt-6 space-y-3">
                {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => onSelect(planCode)}
                disabled={isLoading}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    isLoading
                        ? 'cursor-not-allowed border-white/10 bg-white/5 text-slate-500'
                        : isSelected
                            ? 'border-primary/20 bg-primary/14 text-white hover:bg-primary/20'
                            : 'border-white/10 bg-white/6 text-white hover:bg-primary/10'
                }`}
            >
                {isLoading ? 'Processing...' : checkoutLabel}
                {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
        </motion.div>
    );
}
