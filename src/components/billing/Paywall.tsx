import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Lock, Sparkles, Wallet } from 'lucide-react';
import { CRYPTO_PLAN_DEFINITIONS, MANUAL_PAYMENT_NETWORK_LABEL, MANUAL_PAYMENT_WALLET_ADDRESS } from '../../lib/billing';
import { trackEvent } from '../../lib/analytics';
import PlanCard from './PlanCard';

interface PaywallProps {
    title: string;
    reason: string;
    subtitle?: string;
    compact?: boolean;
}

export default function Paywall({ title, reason, subtitle, compact = false }: PaywallProps) {
    const contentWidth = compact ? 'max-w-4xl' : 'max-w-6xl';
    const panelPadding = compact ? 'p-6' : 'p-8 lg:p-10';

    const headerCopy = useMemo(
        () =>
            subtitle ??
            'You already reached the real value of the product. The next step is a direct wallet payment: send USDT, submit the transaction hash, and wait for approval.',
        [subtitle]
    );

    useEffect(() => {
        trackEvent('paywall_viewed', {
            title,
            reason,
            compact,
        });
    }, [compact, reason, title]);

    return (
        <section className={`mx-auto ${contentWidth}`}>
            <div
                className={`relative overflow-hidden rounded-[2rem] border border-amber-300/15 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.97),rgba(7,10,18,0.98))] ${panelPadding}`}
            >
                <div className="absolute left-10 top-10 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative z-10">
                    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-amber-100">
                                <Crown className="h-4 w-4" />
                                Direct crypto access
                            </div>
                            <h2 className="text-3xl font-bold text-white lg:text-4xl">{title}</h2>
                            <p className="mt-3 text-base leading-7 text-slate-300">{headerCopy}</p>
                        </div>

                        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200 lg:max-w-sm">
                            <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                                <Lock className="h-4 w-4 text-amber-300" />
                                Why this paywall appeared
                            </div>
                            <p>{reason}</p>
                        </div>
                    </div>

                    <div className="mb-6 rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/5 px-5 py-4 text-sm text-cyan-50">
                        <div className="flex items-start gap-3">
                            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-200" />
                            <div>
                                Free still stays honest: one chosen track, the first three days, and a limited hint
                                budget. Paid access is unlocked after manual review of a direct wallet payment.
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
                        <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                            <Wallet className="h-4 w-4 text-amber-300" />
                            Wallet
                        </div>
                        <p className="break-all">{MANUAL_PAYMENT_WALLET_ADDRESS}</p>
                        <p className="mt-2 text-slate-300">Network: {MANUAL_PAYMENT_NETWORK_LABEL}</p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        {CRYPTO_PLAN_DEFINITIONS.map((plan) => (
                            <PlanCard
                                key={plan.planCode}
                                planCode={plan.planCode}
                                title={plan.title}
                                price={plan.price}
                                cadence={plan.cadence}
                                badge={plan.badge}
                                summary={plan.subtitle}
                                features={plan.features}
                                checkoutLabel="Open payment page"
                                onSelect={() => {
                                    window.location.assign('/pricing');
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-6">
                        <Link
                            to="/pricing"
                            className="inline-flex items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-300/20"
                        >
                            Open payment page
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
