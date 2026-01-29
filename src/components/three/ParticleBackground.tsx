import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
    const ref = useRef<THREE.Points>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    // Generate random particle positions
    const particleCount = 700;
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

    // Mouse movement handler
    const handleMouseMove = (event: MouseEvent) => {
        mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Add mouse listener
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, []);

    // Animation loop
    useFrame((state) => {
        if (!ref.current) return;

        const time = state.clock.getElapsedTime();

        // Slow rotation
        ref.current.rotation.x = time * 0.02 + mouseRef.current.y * 0.2;
        ref.current.rotation.y = time * 0.03 + mouseRef.current.x * 0.2;

        // Floating wave effect
        const positions = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const x = positions[i3];

            // Simple floating effect
            positions[i3 + 1] += Math.sin(time + x) * 0.002;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#8b5cf6"
                size={0.05}
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
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        meshRef.current.scale.setScalar(1 + Math.sin(time) * 0.1);
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
            <sphereGeometry args={[2, 32, 32]} />
            <meshBasicMaterial
                color="#6d28d9"
                transparent
                opacity={0.1}
            />
        </mesh>
    );
}

export default function ParticleBackground() {
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

            {/* Three.js Canvas */}
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <ParticleField />
                <GlowingSphere />
            </Canvas>

            {/* Noise overlay for texture */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
