import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function prefersReducedMotion() {
    return typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
}

function pseudoRandom(seed: number) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function ParticleField({ shouldAnimate }: { shouldAnimate: boolean }) {
    const ref = useRef<THREE.Points>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const lastCallRef = useRef(0);
    const particleCount = 300;

    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            pos[i3] = (pseudoRandom(i + 1) - 0.5) * 20;
            pos[i3 + 1] = (pseudoRandom(i + particleCount + 1) - 0.5) * 20;
            pos[i3 + 2] = (pseudoRandom(i + particleCount * 2 + 1) - 0.5) * 20;
        }

        return pos;
    }, []);

    const handleMouseMove = useMemo(
        () => (event: MouseEvent) => {
            const now = Date.now();
            if (now - lastCallRef.current < 50) return;

            lastCallRef.current = now;
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        },
        []
    );

    useEffect(() => {
        if (typeof window === 'undefined' || !shouldAnimate) {
            return;
        }

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove, shouldAnimate]);

    useFrame((state) => {
        if (!ref.current || !shouldAnimate) return;

        const time = state.clock.getElapsedTime();
        ref.current.rotation.x = time * 0.02 + mouseRef.current.y * 0.1;
        ref.current.rotation.y = time * 0.03 + mouseRef.current.x * 0.1;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled>
            <PointMaterial
                transparent
                color="#8b5cf6"
                size={0.06}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function GlowingSphere({ shouldAnimate }: { shouldAnimate: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current || !shouldAnimate) return;

        const time = state.clock.getElapsedTime();
        meshRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05);
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
            <sphereGeometry args={[2, 16, 16]} />
            <meshBasicMaterial color="#6d28d9" transparent opacity={0.08} />
        </mesh>
    );
}

export default function ParticleBackground() {
    const [isVisible] = useState(() => {
        if (typeof window === 'undefined') return true;
        return navigator.hardwareConcurrency > 4 && !prefersReducedMotion();
    });
    const shouldAnimate = isVisible && !prefersReducedMotion();

    return (
        <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-vibe-gradient" />

            <div
                className="absolute inset-0 opacity-50"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                }}
            />

            {isVisible && (
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 60 }}
                    style={{ background: 'transparent' }}
                    dpr={[1, 1.5]}
                    performance={{ min: 0.5 }}
                    gl={{
                        antialias: false,
                        powerPreference: 'high-performance',
                        alpha: true,
                    }}
                >
                    <ParticleField shouldAnimate={shouldAnimate} />
                    <GlowingSphere shouldAnimate={shouldAnimate} />
                </Canvas>
            )}

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
