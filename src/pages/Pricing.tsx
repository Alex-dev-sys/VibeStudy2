import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    Copy,
    Crown,
    ShieldCheck,
    Sparkles,
    Wallet,
} from 'lucide-react';
import PlanCard from '../components/billing/PlanCard';
import {
    CRYPTO_PLAN_DEFINITIONS,
    MANUAL_PAYMENT_NETWORK_LABEL,
    MANUAL_PAYMENT_WALLET_ADDRESS,
} from '../lib/billing';
import { useAuthStore } from '../stores/useAuthStore';
import { useBillingStore } from '../stores/useBillingStore';

export default function Pricing() {
    const { user } = useAuthStore();
    const { isSubmittingPayment, submitPayment, paymentRequests, error } = useBillingStore();
    const [selectedPlanCode, setSelectedPlanCode] = useState<'pro_monthly' | 'pro_three_month'>('pro_monthly');
    const [txHash, setTxHash] = useState('');
    const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const selectedPlan = useMemo(
        () => CRYPTO_PLAN_DEFINITIONS.find((plan) => plan.planCode === selectedPlanCode) ?? CRYPTO_PLAN_DEFINITIONS[0],
        [selectedPlanCode]
    );

    const latestPendingRequest = paymentRequests.find((request) => request.status === 'pending') ?? null;

    const handleSelectPlan = (planCode: 'pro_monthly' | 'pro_three_month') => {
        setSelectedPlanCode(planCode);
        setSuccessMessage(null);

        if (!user) {
            window.location.assign('/auth');
        }
    };

    const handleCopyWallet = async () => {
        try {
            await navigator.clipboard.writeText(MANUAL_PAYMENT_WALLET_ADDRESS);
            setCopyState('copied');
            window.setTimeout(() => setCopyState('idle'), 1500);
        } catch {
            setCopyState('idle');
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user) {
            window.location.assign('/auth');
            return;
        }

        const request = await submitPayment(selectedPlanCode, txHash);
        if (!request) {
            return;
        }

        setTxHash('');
        setSuccessMessage(
            `Payment request received for ${selectedPlan.title}. Status: pending review. We will unlock Pro after checking the transaction hash.`
        );
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#0b1120_0%,#111827_45%,#0b1120_100%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_28%)]" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100">
                        <Crown className="h-4 w-4" />
                        Direct wallet upgrade
                    </div>
                    <h1 className="text-4xl font-bold text-white lg:text-5xl">Pricing without traps</h1>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300 lg:text-lg">
                        Free gives the first real value loop. Paid access is unlocked after you send USDT to the
                        project wallet and submit the transaction hash for review.
                    </p>
                </motion.div>

                <div className="mb-8 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Free</p>
                        <h2 className="mt-2 text-3xl font-bold text-white">0 USDT</h2>
                        <p className="mt-4 text-sm leading-6 text-slate-300">
                            One track, the first three days, and a limited AI hint budget. Enough to feel the product
                            before the upgrade decision.
                        </p>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                            <Wallet className="h-3.5 w-3.5" />
                            Manual crypto unlock
                        </div>
                        <p className="text-sm leading-6 text-slate-300">
                            No third-party checkout. You pay directly to the wallet, paste the transaction hash, and
                            see the request status inside the product.
                        </p>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Billing trust
                        </div>
                        <p className="text-sm leading-6 text-slate-300">
                            Wallet, network, amount, and payment status stay visible. No silent edge-function failure
                            and no fake checkout button.
                        </p>
                    </div>
                </div>

                <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                <Wallet className="h-3.5 w-3.5" />
                                Wallet details
                            </div>
                            <h2 className="text-2xl font-bold text-white">Send payment before submitting the hash</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Network: <span className="font-semibold text-white">{MANUAL_PAYMENT_NETWORK_LABEL}</span>
                                . Use the exact amount from the selected plan, then paste the transaction hash below.
                            </p>
                            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Wallet address</p>
                                <p className="mt-2 break-all text-sm font-semibold text-white">
                                    {MANUAL_PAYMENT_WALLET_ADDRESS}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleCopyWallet()}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-300/20"
                        >
                            <Copy className="h-4 w-4" />
                            {copyState === 'copied' ? 'Copied' : 'Copy wallet'}
                        </button>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-dark-800/70 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Step 1</p>
                            <p className="mt-2 text-sm text-white">Choose a plan and copy the wallet address.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-dark-800/70 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Step 2</p>
                            <p className="mt-2 text-sm text-white">Send the exact USDT amount on TRC20.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-dark-800/70 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Step 3</p>
                            <p className="mt-2 text-sm text-white">Submit the tx hash and wait for approval.</p>
                        </div>
                    </div>
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
                            checkoutLabel={plan.checkoutLabel}
                            isLoading={isSubmittingPayment && selectedPlanCode === plan.planCode}
                            onSelect={handleSelectPlan}
                        />
                    ))}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <form
                        onSubmit={(event) => void handleSubmit(event)}
                        className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
                    >
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-vibe-400/20 bg-vibe-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-vibe-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            Submit tx hash
                        </div>
                        <h2 className="text-2xl font-bold text-white">Selected plan: {selectedPlan.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Amount to send: <span className="font-semibold text-white">{selectedPlan.price}</span>. If
                            you are not signed in yet, the submit action will move you to the login page first.
                        </p>

                        <label className="mt-6 block text-sm font-medium text-slate-200" htmlFor="tx-hash">
                            Transaction hash
                        </label>
                        <textarea
                            id="tx-hash"
                            value={txHash}
                            onChange={(event) => setTxHash(event.target.value)}
                            placeholder="Paste the TRON transaction hash here"
                            rows={4}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/40"
                        />

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                                type="submit"
                                disabled={isSubmittingPayment}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmittingPayment ? 'Submitting...' : 'Submit tx hash'}
                            </button>
                            <p className="text-sm text-slate-400">
                                Review is manual. Access opens after the payment request is approved.
                            </p>
                        </div>

                        {successMessage ? (
                            <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>{successMessage}</span>
                                </div>
                            </div>
                        ) : null}

                        {error ? (
                            <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                {error}
                            </div>
                        ) : null}
                    </form>

                    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                        <h2 className="text-2xl font-bold text-white">Payment status</h2>
                        {latestPendingRequest ? (
                            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
                                <p className="font-semibold">Pending review</p>
                                <p className="mt-2">
                                    Latest request: {latestPendingRequest.plan_code} at {latestPendingRequest.expected_amount}{' '}
                                    {latestPendingRequest.asset_symbol}
                                </p>
                                <p className="mt-2 break-all text-amber-100">
                                    Tx hash: {latestPendingRequest.tx_hash}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-4 text-sm leading-6 text-slate-300">
                                No pending requests yet. Once you submit a hash, the request will appear here and in
                                your profile.
                            </p>
                        )}

                        <div className="mt-6 space-y-3 text-sm text-slate-300">
                            <p>If you already paid and do not see access yet, open the profile page and check the request status.</p>
                            <p>Need help? Send the tx hash to support together with the email of the account you used for login.</p>
                        </div>
                    </div>
                </div>

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
