import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import { resetAnalyticsUser } from './lib/analytics';
import { useAuthStore } from './stores/useAuthStore';
import { useBillingStore } from './stores/useBillingStore';
import { useProgressStore } from './stores/useProgressStore';

const Home = lazy(() => import('./pages/Home'));
const Playground = lazy(() => import('./pages/Playground'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Lessons = lazy(() => import('./pages/Lessons'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Support = lazy(() => import('./pages/Support'));

const PageLoader = () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex animate-pulse flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent bg-primary/20" />
            <span className="text-muted-foreground">Загрузка...</span>
        </div>
    </div>
);

function DemoEntry() {
    const enterDemo = useAuthStore((state) => state.enterDemo);
    const navigate = useNavigate();

    useEffect(() => {
        enterDemo();
        navigate('/home', { replace: true });
    }, [enterDemo, navigate]);

    return <PageLoader />;
}

function ProtectedRoute() {
    const { user, isInitialized, isLoading } = useAuthStore();

    if (!isInitialized || isLoading) {
        return <PageLoader />;
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
}

function PublicOnlyRoute() {
    const { user, isInitialized, isLoading } = useAuthStore();

    if (!isInitialized || isLoading) {
        return <PageLoader />;
    }

    if (user) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

function App() {
    const { initialize, user, isInitialized, isDemo } = useAuthStore();
    const { fetchProgress, loadDemoProgress, resetProgress } = useProgressStore();
    const { hydrate: hydrateBilling, clear: clearBilling } = useBillingStore();



    useEffect(() => {
        void initialize();
    }, [initialize]);

    useEffect(() => {
        if (isInitialized && isDemo) {
            loadDemoProgress();
            clearBilling();
            return;
        }

        if (isInitialized && user?.id) {
            void fetchProgress(user.id);
            void hydrateBilling(user.id);
            return;
        }

        if (isInitialized && !user) {
            resetProgress();
            clearBilling();
            resetAnalyticsUser();
        }
    }, [isInitialized, isDemo, user, fetchProgress, loadDemoProgress, resetProgress, hydrateBilling, clearBilling]);


    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="demo" element={<DemoEntry />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="terms" element={<Terms />} />
                    <Route path="support" element={<Support />} />
                    <Route element={<PublicOnlyRoute />}>
                        <Route path="auth" element={<Auth />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="home" element={<Home />} />
                            <Route path="lessons" element={<Lessons />} />
                            <Route path="lessons/:courseId" element={<Lessons />} />
                            <Route path="lessons/:courseId/:dayParam" element={<Lessons />} />
                            <Route path="playground" element={<Playground />} />
                            <Route path="challenges" element={<Challenges />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
