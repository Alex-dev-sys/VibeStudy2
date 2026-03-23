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
    isLoading = false,
    onSelect,
}: PlanCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(10,13,24,0.98))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
        >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />

            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-amber-200/70">VibeStudy Crypto</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">{title}</h3>
                </div>
                {badge ? (
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                        {badge}
                    </span>
                ) : null}
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-300">{summary}</p>

            <div className="mt-6 flex items-end gap-2">
                <span className="font-serif text-5xl leading-none text-white">{price}</span>
                <span className="pb-1 text-sm uppercase tracking-[0.18em] text-slate-400">{cadence}</span>
            </div>

            <div className="mt-6 space-y-3">
                {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
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
                        : 'border-amber-300/35 bg-amber-300/10 text-white hover:bg-amber-300/18'
                }`}
            >
                {isLoading ? 'Processing...' : checkoutLabel}
                {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
        </motion.div>
    );
}
