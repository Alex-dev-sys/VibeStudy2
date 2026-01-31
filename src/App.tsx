import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import MobileNotSupported from './pages/MobileNotSupported';
import Home from './pages/Home';
import Playground from './pages/Playground';
import Challenges from './pages/Challenges';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Lessons from './pages/Lessons';
import { useAuthStore } from './stores/useAuthStore';
import { useProgressStore } from './stores/useProgressStore';

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
    </BrowserRouter>
  );
}

export default App;
