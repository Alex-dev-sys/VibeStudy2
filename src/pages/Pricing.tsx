import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BadgeCheck,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Crown,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
    WalletCards,
} from 'lucide-react';
import PlanCard from '../components/billing/PlanCard';
import { CRYPTO_PLAN_DEFINITIONS } from '../lib/billing';
import { trackEvent } from '../lib/analytics';
import { useAuthStore } from '../stores/useAuthStore';
import { useBillingStore } from '../stores/useBillingStore';

type PaidPlanCode = 'pro_monthly' | 'pro_three_month';

function formatAccessDate(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

const checkoutTrust = [
    {
        icon: ShieldCheck,
        label: 'Secure transaction via Binance',
        body: 'Hosted payment page, clear order window, and a flow that feels premium instead of improvised.',
    },
    {
        icon: Clock3,
        label: 'Instant access after confirmation',
        body: 'As soon as the payment is confirmed, the paid route can unlock without forcing you through manual support loops.',
    },
    {
        icon: LockKeyhole,
        label: 'No auto-renew',
        body: 'Each checkout is a clean one-time payment for a fixed access window. No recurring surprise charges.',
    },
];

const proMoments = [
    'All tracks and all lesson days',
    'Unlimited AI hints and review summaries',
    'Hosted-first Binance Pay experience',
    'A cleaner profile and billing surface',
];

export default function Pricing() {
    const { user } = useAuthStore();
    const { access, subscription, startCheckout, isStartingCheckout, error: billingError } = useBillingStore();
    const [selectedPlanCode, setSelectedPlanCode] = useState<PaidPlanCode>('pro_three_month');
    const [pendingPlanCode, setPendingPlanCode] = useState<PaidPlanCode | null>(null);

    const selectedPlan = useMemo(
        () => CRYPTO_PLAN_DEFINITIONS.find((plan) => plan.planCode === selectedPlanCode) ?? CRYPTO_PLAN_DEFINITIONS[0],
        [selectedPlanCode]
    );
    const billingState = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('billing');

    const accessEndDate = formatAccessDate(access.currentPeriodEnd ?? subscription?.current_period_end);
    const checkoutStatusCopy = access.canAccessPaidFeatures
        ? `Pro is already active${accessEndDate ? ` until ${accessEndDate}` : ''}.`
        : user
            ? 'Select the access window you want and move into a secure Binance-hosted checkout.'
            : 'Choose a plan now. You will sign in before the secure Binance-hosted checkout opens.';
    const billingBanner =
        billingState === 'cancelled'
            ? 'Checkout was canceled before payment. You can retry whenever you want.'
            : billingError;

    const handleSelectPlan = async (planCode: PaidPlanCode) => {
        setSelectedPlanCode(planCode);

        if (!user) {
            window.location.assign('/auth');
            return;
        }

        trackEvent('checkout_started', {
            provider: 'binance',
            planCode,
        });

        setPendingPlanCode(planCode);
        const session = await startCheckout(planCode, {
            successPath: '/profile?billing=success',
            cancelPath: '/pricing?billing=cancelled',
        });
        setPendingPlanCode(null);

        if (!session) {
            return;
        }

        window.location.assign(session.url);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#060A12] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,92,255,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_top,rgba(255,154,194,0.10),transparent_24%),linear-gradient(180deg,#060A12_0%,#0A1020_48%,#060A12_100%)]" />
            <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
                >
                    <div className="rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,29,0.92),rgba(8,11,19,0.98))] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:p-10">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                            <Crown className="h-4 w-4" />
                            Hosted-first Binance Pay checkout
                        </div>

                        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white lg:text-6xl">
                            Binance Pay checkout that feels like a premium product.
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
                            Clean one-time payment. No auto-renew. A secure transaction via Binance with a checkout
                            surface that finally looks intentional, not patched together.
                        </p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Access</p>
                                <p className="mt-2 text-lg font-semibold text-white">30 or 90 days</p>
                                <p className="mt-1 text-sm text-slate-300">Fixed access windows with no subscription trap.</p>
                            </div>
                            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Payment</p>
                                <p className="mt-2 text-lg font-semibold text-white">one-time payment</p>
                                <p className="mt-1 text-sm text-slate-300">You pay once for the exact period you choose.</p>
                            </div>
                            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Trust</p>
                                <p className="mt-2 text-lg font-semibold text-white">Binance-hosted</p>
                                <p className="mt-1 text-sm text-slate-300">A clearer payment story for the user and the product.</p>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        id="binance-checkout-summary"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.08 }}
                        className="relative overflow-hidden rounded-[2.4rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(8,12,20,0.98))] p-8 shadow-[0_26px_80px_rgba(0,0,0,0.48)]"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,92,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(7,198,239,0.10),transparent_24%)]" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Checkout summary
                            </div>

                            <h2 className="mt-4 text-3xl font-bold text-white">Selected access window</h2>
                            <p className="mt-2 text-lg font-semibold text-white">{selectedPlan.title}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{selectedPlan.subtitle}</p>

                            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Selected plan</p>
                                        <p className="mt-2 text-4xl font-bold text-white">{selectedPlan.price}</p>
                                    </div>
                                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                                        {selectedPlan.cadence}
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3 text-sm text-slate-200">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                                        <span>Secure transaction via Binance</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                                        <span>Instant access after confirmation</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                                        <span>No auto-renew</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5">
                                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Account state</p>
                                <p className="mt-3 text-sm leading-6 text-slate-200">{checkoutStatusCopy}</p>
                                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                    <Link
                                        to={user ? '/profile' : '/auth'}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-primary/10"
                                    >
                                        {user ? 'Open billing profile' : 'Login before checkout'}
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        to="/support"
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                                    >
                                        Need help
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                {billingBanner ? (
                    <div className="mt-6 rounded-[1.4rem] border border-rose-300/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-50">
                        {billingBanner}
                    </div>
                ) : null}

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-8 grid gap-4 lg:grid-cols-3"
                >
                    {checkoutTrust.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
                        >
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                                <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-lg font-semibold text-white">{item.label}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                        </div>
                    ))}
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]"
                >
                    <div>
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Choose your access</p>
                                <h2 className="mt-2 text-3xl font-bold text-white">Access windows</h2>
                            </div>
                            <p className="text-sm text-slate-300">Pick the duration, then continue to secure Binance Pay.</p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
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
                                        checkoutLabel={plan.checkoutLabel}
                                        isSelected={selectedPlanCode === plan.planCode}
                                        isLoading={isStartingCheckout && pendingPlanCode === plan.planCode}
                                        onSelect={handleSelectPlan}
                                    />
                                ))}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,19,31,0.98),rgba(9,13,22,0.98))] p-6">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                What Pro feels like
                            </div>
                            <div className="space-y-3">
                                {proMoments.map((item) => (
                                    <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                                <WalletCards className="h-3.5 w-3.5" />
                                Payment notes
                            </div>
                            <div className="space-y-4 text-sm leading-6 text-slate-300">
                                <p>
                                    Free stays free until you feel real value. Paid access starts when you want the full route,
                                    more AI, and a cleaner learning rhythm.
                                </p>
                                <p>
                                    This checkout is intentionally simple: a one-time payment, a fixed access window, and a
                                    premium payment surface instead of subscription clutter.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="mt-8 rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,27,0.98),rgba(8,11,18,0.98))] p-6 lg:p-8"
                >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Billing philosophy</p>
                            <h2 className="mt-2 text-2xl font-bold text-white">No friction, no hidden renewal, no fake urgency.</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                The product finally looks like it respects the money step: a clear plan, a secure payment rail,
                                and billing copy that does not feel like an afterthought.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                to={user ? '/profile' : '/auth'}
                                className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/16"
                            >
                                {user ? 'Review account access' : 'Login to continue'}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/support"
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                            >
                                Talk to support
                            </Link>
                        </div>
                    </div>
                </motion.section>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
                    <Link to="/privacy" className="transition-colors hover:text-white">
                        Privacy
                    </Link>
                    <Link to="/terms" className="transition-colors hover:text-white">
                        Terms
                    </Link>
                    <Link to="/support" className="transition-colors hover:text-white">
                        Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
