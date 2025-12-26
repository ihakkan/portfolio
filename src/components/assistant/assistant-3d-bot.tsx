'use client';

/**
 * 3D Assistant Bot Component
 * Visual companion using ThreeJS with state-based animations
 * Now includes mouse tracking - bot looks at cursor when idle!
 */

import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

type BotState = 'idle' | 'listening' | 'speaking' | 'thinking';

interface Assistant3DBotProps {
    state?: BotState;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ============ Bot Head Component ============

interface BotHeadProps {
    state: BotState;
    mousePosition: { x: number; y: number };
}

const BotHead: React.FC<BotHeadProps> = ({ state, mousePosition }) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const mouthRef = useRef<THREE.Mesh>(null);

    // Smooth mouse position for natural movement
    const smoothMouse = useRef({ x: 0, y: 0 });

    // Colors based on state
    const colors = useMemo(() => {
        switch (state) {
            case 'listening':
                return {
                    body: '#10b981', // Emerald
                    glow: '#34d399',
                    eyes: '#ffffff',
                };
            case 'speaking':
                return {
                    body: '#8b5cf6', // Violet
                    glow: '#a78bfa',
                    eyes: '#ffffff',
                };
            case 'thinking':
                return {
                    body: '#f59e0b', // Amber
                    glow: '#fbbf24',
                    eyes: '#ffffff',
                };
            default:
                return {
                    body: '#3b82f6', // Blue
                    glow: '#60a5fa',
                    eyes: '#ffffff',
                };
        }
    }, [state]);

    // Animation based on state + mouse tracking
    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        const t = clock.getElapsedTime();

        // Smoothly interpolate mouse position - faster response
        smoothMouse.current.x += (mousePosition.x - smoothMouse.current.x) * 0.12;
        smoothMouse.current.y += (mousePosition.y - smoothMouse.current.y) * 0.12;

        // Base floating animation
        const floatY = Math.sin(t * 1.5) * 0.06;

        // State-specific animations
        switch (state) {
            case 'listening':
                // Attentive pose with mouse following
                groupRef.current.position.y = floatY;
                groupRef.current.rotation.x = Math.sin(t * 2) * 0.05 + 0.12 + smoothMouse.current.y * 0.25;
                groupRef.current.rotation.y = Math.sin(t * 1.5) * 0.08 + smoothMouse.current.x * 0.35;
                groupRef.current.rotation.z = smoothMouse.current.x * -0.08;
                const listenPulse = 1 + Math.sin(t * 4) * 0.03;
                groupRef.current.scale.setScalar(listenPulse);
                break;

            case 'speaking':
                // Animated speaking - no mouse tracking
                groupRef.current.position.y = floatY + Math.sin(t * 8) * 0.03;
                groupRef.current.rotation.x = Math.sin(t * 3) * 0.1;
                groupRef.current.rotation.y = Math.sin(t * 2) * 0.25;
                groupRef.current.rotation.z = Math.sin(t * 4) * 0.06;
                groupRef.current.scale.setScalar(1);
                break;

            case 'thinking':
                // Contemplative with slight mouse awareness
                groupRef.current.position.y = floatY;
                groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1 + smoothMouse.current.y * 0.15;
                groupRef.current.rotation.y = t * 0.25 + smoothMouse.current.x * 0.2;
                groupRef.current.rotation.z = 0;
                groupRef.current.scale.setScalar(1);
                break;

            default: // idle - SUPER IMPACTFUL mouse tracking!
                groupRef.current.position.y = floatY + smoothMouse.current.y * 0.05;
                groupRef.current.position.x = smoothMouse.current.x * 0.08;
                // Strong head rotation following cursor
                groupRef.current.rotation.x = smoothMouse.current.y * 0.5;
                groupRef.current.rotation.y = smoothMouse.current.x * 0.7;
                groupRef.current.rotation.z = smoothMouse.current.x * -0.12; // Dramatic tilt
                groupRef.current.scale.setScalar(1);
        }

        // Eye blinking
        if (leftEyeRef.current && rightEyeRef.current) {
            const blinkCycle = (t % 4);
            if (blinkCycle > 3.8 && blinkCycle < 4) {
                leftEyeRef.current.scale.y = 0.1;
                rightEyeRef.current.scale.y = 0.1;
            } else {
                leftEyeRef.current.scale.y = 1;
                rightEyeRef.current.scale.y = 1;
            }

            // Eyes follow mouse when idle or listening
            if (state === 'idle' || state === 'listening') {
                const eyeOffsetX = smoothMouse.current.x * 0.03;
                const eyeOffsetY = smoothMouse.current.y * 0.02;
                leftEyeRef.current.position.x = -0.3 + eyeOffsetX;
                leftEyeRef.current.position.y = 0.1 + eyeOffsetY;
                rightEyeRef.current.position.x = 0.3 + eyeOffsetX;
                rightEyeRef.current.position.y = 0.1 + eyeOffsetY;
            } else {
                leftEyeRef.current.position.x = -0.3;
                leftEyeRef.current.position.y = 0.1;
                rightEyeRef.current.position.x = 0.3;
                rightEyeRef.current.position.y = 0.1;
            }
        }

        // Mouth animation
        if (mouthRef.current) {
            if (state === 'speaking') {
                mouthRef.current.scale.y = 0.4 + Math.abs(Math.sin(t * 12)) * 0.6;
                mouthRef.current.scale.x = 1 + Math.sin(t * 8) * 0.1;
            } else if (state === 'listening') {
                mouthRef.current.scale.y = 0.4;
                mouthRef.current.scale.x = 1.1;
            } else {
                mouthRef.current.scale.y = 0.3;
                mouthRef.current.scale.x = 1;
            }
        }
    });

    return (
        <group ref={groupRef}>
            {/* Main Head */}
            <RoundedBox args={[1.5, 1.5, 1.2]} radius={0.3} smoothness={4}>
                <meshStandardMaterial color={colors.body} metalness={0.3} roughness={0.4} />
            </RoundedBox>

            {/* Antenna */}
            <group position={[0, 1, 0]}>
                <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.4]} />
                    <meshStandardMaterial color={colors.body} metalness={0.5} />
                </mesh>
                <Sphere args={[0.12]} position={[0, 0.45, 0]}>
                    <meshStandardMaterial
                        color={colors.glow}
                        emissive={colors.glow}
                        emissiveIntensity={state === 'listening' ? 2 : 0.5}
                    />
                </Sphere>
            </group>

            {/* Face Panel */}
            <RoundedBox
                args={[1.2, 0.9, 0.1]}
                radius={0.1}
                smoothness={2}
                position={[0, 0, 0.6]}
            >
                <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.8} />
            </RoundedBox>

            {/* Left Eye */}
            <Sphere
                ref={leftEyeRef}
                args={[0.15]}
                position={[-0.3, 0.1, 0.7]}
            >
                <meshStandardMaterial
                    color={colors.eyes}
                    emissive={colors.glow}
                    emissiveIntensity={0.3}
                />
            </Sphere>

            {/* Right Eye */}
            <Sphere
                ref={rightEyeRef}
                args={[0.15]}
                position={[0.3, 0.1, 0.7]}
            >
                <meshStandardMaterial
                    color={colors.eyes}
                    emissive={colors.glow}
                    emissiveIntensity={0.3}
                />
            </Sphere>

            {/* Mouth */}
            <RoundedBox
                ref={mouthRef}
                args={[0.4, 0.15, 0.05]}
                radius={0.05}
                smoothness={2}
                position={[0, -0.25, 0.7]}
            >
                <meshStandardMaterial
                    color={state === 'speaking' ? colors.glow : '#475569'}
                    emissive={state === 'speaking' ? colors.glow : '#000000'}
                    emissiveIntensity={state === 'speaking' ? 1 : 0}
                />
            </RoundedBox>

            {/* Ear panels */}
            <RoundedBox args={[0.1, 0.4, 0.3]} radius={0.05} position={[-0.85, 0, 0]}>
                <meshStandardMaterial color={colors.body} metalness={0.3} />
            </RoundedBox>
            <RoundedBox args={[0.1, 0.4, 0.3]} radius={0.05} position={[0.85, 0, 0]}>
                <meshStandardMaterial color={colors.body} metalness={0.3} />
            </RoundedBox>

            {/* State-based glow ring */}
            {(state === 'listening' || state === 'speaking') && (
                <mesh position={[0, 0, 0]}>
                    <torusGeometry args={[1.1, 0.03, 8, 32]} />
                    <meshStandardMaterial
                        color={colors.glow}
                        emissive={colors.glow}
                        emissiveIntensity={2}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            )}
        </group>
    );
};

// ============ Scene Component ============

interface SceneProps {
    state: BotState;
    mousePosition: { x: number; y: number };
}

const Scene: React.FC<SceneProps> = ({ state, mousePosition }) => {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-3, 2, 4]} intensity={0.4} color="#60a5fa" />

            <Float
                speed={2}
                rotationIntensity={0.2}
                floatIntensity={0.3}
            >
                <BotHead state={state} mousePosition={mousePosition} />
            </Float>

            <Particles count={50} color={
                state === 'listening' ? '#34d399' :
                    state === 'speaking' ? '#a78bfa' :
                        state === 'thinking' ? '#fbbf24' :
                            '#60a5fa'
            } />
        </>
    );
};

// ============ Particles Component ============

interface ParticlesProps {
    count: number;
    color: string;
}

const Particles: React.FC<ParticlesProps> = ({ count, color }) => {
    const points = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
        return positions;
    }, [count]);

    const pointsRef = useRef<THREE.Points>(null);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[points, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.05} color={color} transparent opacity={0.6} />
        </points>
    );
};

// ============ Main Component ============

const Assistant3DBot: React.FC<Assistant3DBotProps> = ({
    state = 'idle',
    className,
    size = 'md',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Track mouse position relative to container - limited to chat panel area
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();

            // Find the chat panel container (parent with fixed positioning)
            const chatPanel = containerRef.current.closest('.fixed');
            if (!chatPanel) {
                // Fallback: use container rect
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const x = (e.clientX - centerX) / (rect.width / 2);
                const y = (e.clientY - centerY) / (rect.height / 2);
                setMousePosition({
                    x: Math.max(-1, Math.min(1, x)),
                    y: Math.max(-1, Math.min(1, y)),
                });
                return;
            }

            const panelRect = chatPanel.getBoundingClientRect();

            // Check if mouse is within or near the chat panel (with padding)
            const padding = 50;
            const isInPanel =
                e.clientX >= panelRect.left - padding &&
                e.clientX <= panelRect.right + padding &&
                e.clientY >= panelRect.top - padding &&
                e.clientY <= panelRect.bottom + padding;

            if (isInPanel) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Normalize relative to panel size for more dramatic movement
                const x = (e.clientX - centerX) / (panelRect.width / 3);
                const y = (e.clientY - centerY) / (panelRect.height / 3);

                setMousePosition({
                    x: Math.max(-1, Math.min(1, x)),
                    y: Math.max(-1, Math.min(1, y)),
                });
            } else {
                // Slowly reset to center when mouse leaves panel
                setMousePosition(prev => ({
                    x: prev.x * 0.95,
                    y: prev.y * 0.95,
                }));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const sizeClasses = {
        sm: 'w-24 h-24',
        md: 'w-32 h-32',
        lg: 'w-48 h-48',
        xl: 'w-64 h-64',
    };

    return (
        <div ref={containerRef} className={cn(sizeClasses[size], 'relative', className)}>
            <Canvas
                camera={{ position: [0, 0, 4], fov: 45 }}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <Scene state={state} mousePosition={mousePosition} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Assistant3DBot;
