import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONFIG, COLORS } from '../constants';
import { TreeMorphState } from '../types';

export const SpiralLights: React.FC<{ morphState: TreeMorphState }> = ({ morphState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // High count to simulate a continuous LED strip
  const count = 450; 
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Pre-calculate spiral positions
  const particles = useMemo(() => {
    const data = [];
    const height = CONFIG.TREE_HEIGHT;
    // Spiral radius tapers with cone, but stays slightly outside
    const maxRadius = CONFIG.TREE_RADIUS + 0.5; 
    const loops = 9; // Number of spiral turns

    for (let i = 0; i < count; i++) {
      // t goes from 0 (top) to 1 (bottom)
      const t = i / (count - 1);
      
      // Calculate Y: Top (+height/2) to Bottom (-height/2)
      // Slight buffer so it doesn't touch floor exactly
      const y = (0.5 - t * 0.98) * height;
      
      // Calculate Radius: Cone shape (linear increase)
      const r = t * maxRadius; 
      
      // Calculate Angle: Spiral
      const angle = t * Math.PI * 2 * loops;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      data.push({
        pos: new THREE.Vector3(x, y, z),
        phase: Math.random() * Math.PI * 2,
        // Mix of Cyber Blue and Barbie Pink LEDs
        colorIdx: Math.random() > 0.5 ? 0 : 1, 
        speed: 3 + Math.random() * 4
      });
    }
    return data;
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const isTree = morphState === TreeMorphState.TREE_SHAPE;
    
    particles.forEach((p, i) => {
      // 1. Position
      dummy.position.copy(p.pos);
      
      // 2. Scale Animation
      // When tree formed: base scale small (LED size). When chaos: scale 0 (hidden).
      const baseSize = 0.08;
      const targetBase = isTree ? baseSize : 0;
      
      // Fast blinking / shimmering effect
      const blink = Math.sin(time * p.speed + p.phase); 
      // Add some jitter to scale for energy
      const jitter = blink * 0.02;

      const targetScale = targetBase > 0 ? targetBase + jitter : 0;

      // Smooth transition (Lerp)
      const currentScale = dummy.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 5);
      
      dummy.scale.setScalar(nextScale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // 3. Color Animation
      // Switch between defined palette
      const baseColor = p.colorIdx === 0 ? COLORS.CYBER_BLUE : COLORS.BARBIE_PINK;
      tempColor.set(baseColor);
      
      // Bloom Boost: Make them super bright periodically
      // Map sine wave [-1, 1] to brightness boost [1.0, 5.0]
      const brightness = 1.0 + Math.max(0, blink) * 4.0;
      tempColor.multiplyScalar(brightness);
      
      meshRef.current!.setColorAt(i, tempColor);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Use a simple Box for a 'pixel' LED look */}
      <boxGeometry args={[1, 1, 1]} />
      {/* MeshBasicMaterial ensures they glow brightly regardless of scene lighting (emissive effect) */}
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};