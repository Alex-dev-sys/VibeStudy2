import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Check if user prefers reduced motion
const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

function ParticleField() {
    const ref = useRef<THREE.Points>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    // Reduced particle count for better performance
    const particleCount = 300;
    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            pos[i3] = (Math.random() - 0.5) * 20;
            pos[i3 + 1] = (Math.random() - 0.5) * 20;
            pos[i3 + 2] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, []);

    // Throttled mouse movement handler
    const handleMouseMove = useMemo(() => {
        let lastCall = 0;
        return (event: MouseEvent) => {
            const now = Date.now();
            if (now - lastCall < 50) return; // Throttle to 20fps
            lastCall = now;
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && !prefersReducedMotion) {
            window.addEventListener('mousemove', handleMouseMove, { passive: true });
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [handleMouseMove]);

    // Simplified animation loop - only rotation, no per-particle updates
    useFrame((state) => {
        if (!ref.current || prefersReducedMotion) return;

        const time = state.clock.getElapsedTime();

        // Simple rotation only - much faster than updating particle positions
        ref.current.rotation.x = time * 0.02 + mouseRef.current.y * 0.1;
        ref.current.rotation.y = time * 0.03 + mouseRef.current.x * 0.1;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled>
            <PointMaterial
                transparent
                color="#8b5cf6"
                size={0.06}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function GlowingSphere() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current || prefersReducedMotion) return;
        const time = state.clock.getElapsedTime();
        meshRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05);
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
            <sphereGeometry args={[2, 16, 16]} />
            <meshBasicMaterial
                color="#6d28d9"
                transparent
                opacity={0.08}
            />
        </mesh>
    );
}

export default function ParticleBackground() {
    const [isVisible, setIsVisible] = useState(true);

    // Disable on low-end devices
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isLowEnd = navigator.hardwareConcurrency <= 4 || prefersReducedMotion;
            setIsVisible(!isLowEnd);
        }
    }, []);

    return (
        <div className="fixed inset-0 -z-10">
            {/* Base gradient background */}
            <div className="absolute inset-0 bg-vibe-gradient" />

            {/* Radial glow overlay */}
            <div
                className="absolute inset-0 opacity-50"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
                }}
            />

            {/* Three.js Canvas - only render if device can handle it */}
            {isVisible && (
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 60 }}
                    style={{ background: 'transparent' }}
                    dpr={[1, 1.5]} // Limit pixel ratio for performance
                    performance={{ min: 0.5 }} // Allow frame drops
                    gl={{
                        antialias: false,
                        powerPreference: 'high-performance',
                        alpha: true
                    }}
                >
                    <ParticleField />
                    <GlowingSphere />
                </Canvas>
            )}

            {/* Noise overlay for texture */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}

