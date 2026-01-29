import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="lessons/:courseId" element={<Lessons />} />
          <Route path="lessons/:courseId/:dayParam" element={<Lessons />} />
          <Route path="playground" element={<Playground />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="auth" element={<Auth />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
