import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import MobileNotSupported from './pages/MobileNotSupported';
import Auth from './pages/Auth';
import { useAuthStore } from './stores/useAuthStore';
import { useProgressStore } from './stores/useProgressStore';

// Lazy load heavy pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Playground = lazy(() => import('./pages/Playground'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Lessons = lazy(() => import('./pages/Lessons'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/20 animate-spin border-2 border-primary border-t-transparent" />
      <span className="text-muted-foreground">Загрузка...</span>
    </div>
  </div>
);

function App() {
  const { initialize, user, isInitialized } = useAuthStore();
  const { fetchProgress } = useProgressStore();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize auth on app load
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch progress when user is authenticated
  useEffect(() => {
    if (isInitialized && user?.id) {
      fetchProgress(user.id);
    }
  }, [isInitialized, user?.id, fetchProgress]);

  // Show mobile not supported page for mobile devices
  if (isMobile) {
    return <MobileNotSupported />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="auth" element={<Auth />} />
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
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

