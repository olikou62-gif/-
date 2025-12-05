import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MorphingGroupProps, TreeMorphState, ParticleData } from '../types';
import { CONFIG } from '../constants';

const tempObject = new THREE.Object3D();
const tempVec3 = new THREE.Vector3();

export const MorphingInstances: React.FC<MorphingGroupProps> = ({
  count,
  geometry,
  material,
  morphState,
  colorPalette,
  scaleRange,
  type
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // pre-calculate all positions once
  const particles = useMemo(() => {
    const data: ParticleData[] = [];
    const colorArray = new Float32Array(count * 3);
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // --- 1. SCATTER POSITION (Sphere/Cloud) ---
      // Uniform random point in sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(Math.random()) * CONFIG.SCATTER_RADIUS; // cbrt for uniform distribution
      
      const scatterPos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

      // --- 2. TREE POSITION (Cone) ---
      // y goes from -height/2 to height/2
      const yNorm = Math.random(); // 0 to 1 (bottom to top)
      const y = (yNorm - 0.5) * CONFIG.TREE_HEIGHT;
      
      // Radius decreases as Y increases
      const currentRadius = (1 - yNorm) * CONFIG.TREE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      
      // Add some noise to tree shape so it's not a perfect plastic cone
      const rNoise = (Math.random() - 0.5) * 0.5;
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * (currentRadius + rNoise),
        y,
        Math.sin(angle) * (currentRadius + rNoise)
      );

      // Rotations
      const scatterRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      // Tree rotation: Point outwards or upwards depending on type
      const treeRot = new THREE.Euler();
      if (type === 'NEEDLE') {
        // Needles point somewhat out and up
        treeRot.set(-0.5, -angle, 0); 
      } else {
        treeRot.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      }

      data.push({
        scatterPosition: scatterPos,
        scatterRotation: scatterRot,
        treePosition: treePos,
        treeRotation: treeRot,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
      });

      // --- COLORS ---
      const hex = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      tempColor.set(hex);
      // Add some cyber brightness variation
      if (Math.random() > 0.8) tempColor.addScalar(0.2);
      
      tempColor.toArray(colorArray, i * 3);
    }
    return { data, colors: colorArray };
  }, [count, colorPalette, type]);

  // Apply colors once
  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(particles.colors, 3);
    }
  }, [particles]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const isTree = morphState === TreeMorphState.TREE_SHAPE;

    // We act directly on the matrix for performance
    for (let i = 0; i < count; i++) {
      const p = particles.data[i];
      
      // 1. Determine Target
      const targetPos = isTree ? p.treePosition : p.scatterPosition;
      
      // 2. Add Float/Hover Animation
      // When scattered: chaotic floating. When tree: gentle breathing.
      const hoverAmp = isTree ? 0.1 : 0.5;
      const hoverFreq = isTree ? 1.0 : 0.5;
      
      const hoverX = Math.sin(time * p.speed + p.phase) * hoverAmp;
      const hoverY = Math.cos(time * p.speed * 0.8 + p.phase) * hoverAmp;
      const hoverZ = Math.sin(time * p.speed * 1.2 + p.phase) * hoverAmp;

      const finalTarget = tempVec3.copy(targetPos).addScalar(0); // Clone
      if (!isTree || type !== 'NEEDLE') {
          finalTarget.x += hoverX;
          finalTarget.y += hoverY;
          finalTarget.z += hoverZ;
      }
      
      // 3. Interpolate (Smooth Damp) current position towards target
      // We recover the current matrix position to lerp from it
      meshRef.current.getMatrixAt(i, tempObject.matrix);
      tempObject.matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale);
      
      // Lerp Position
      tempObject.position.lerp(finalTarget, delta * CONFIG.TRANSITION_SPEED);
      
      // Lerp Rotation (Slerp-ish via simple lerp for performance or lookAt)
      if (isTree && type === 'NEEDLE') {
         // Needles orientation is fixed in tree mode
         const targetEuler = p.treeRotation;
         const currentEuler = tempObject.rotation;
         // Simple linear euler interpolation (good enough for small angles, faster than quaternion slerp for 2000 obj)
         tempObject.rotation.set(
             THREE.MathUtils.lerp(currentEuler.x, targetEuler.x, delta * CONFIG.TRANSITION_SPEED),
             THREE.MathUtils.lerp(currentEuler.y, targetEuler.y, delta * CONFIG.TRANSITION_SPEED),
             THREE.MathUtils.lerp(currentEuler.z, targetEuler.z, delta * CONFIG.TRANSITION_SPEED)
         );
      } else {
         // Continuous rotation for ornaments/scattered items
         tempObject.rotation.x += delta * p.speed * 0.5;
         tempObject.rotation.y += delta * p.speed * 0.5;
      }

      // Scale (Pop effect)
      // If we switched modes recently, we could animate scale, but for now fixed scale is fine
      // Maybe pulse to beat?
      const scaleBase = THREE.MathUtils.lerp(scaleRange[0], scaleRange[1], (Math.sin(p.phase) + 1) / 2);
      tempObject.scale.setScalar(scaleBase);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};
