import { Suspense, lazy, Component, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

// Lazy load Three.js to prevent blocking
const ParticleBackground = lazy(() => import('../three/ParticleBackground'));

// Error boundary for Three.js crashes
interface ErrorBoundaryState {
    hasError: boolean;
}

class ThreeErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.warn('Three.js failed to load:', error.message);
    }

    render() {
        if (this.state.hasError) {
            // Fallback gradient if Three.js fails
            return <GradientBackground />;
        }
        return this.props.children;
    }
}

// Simple gradient background fallback
function GradientBackground() {
    return (
        <div
            className="fixed inset-0 -z-10"
            style={{
                background: 'radial-gradient(ellipse at center, #1e0b36 0%, #0a0510 100%)'
            }}
        >
            {/* Animated gradient overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)'
                }}
            />
        </div>
    );
}

// Loading state
function LoadingBackground() {
    return (
        <div
            className="fixed inset-0 -z-10"
            style={{
                background: 'radial-gradient(ellipse at center, #1e0b36 0%, #0a0510 100%)'
            }}
        />
    );
}

export default function Layout() {
    return (
        <div className="min-h-screen relative">
            <ThreeErrorBoundary>
                <Suspense fallback={<LoadingBackground />}>
                    <ParticleBackground />
                </Suspense>
            </ThreeErrorBoundary>
            <Header />
            <main className="pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
