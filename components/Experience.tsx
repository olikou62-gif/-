import React, { useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { MorphingInstances } from './MorphingInstances';
import { SpiralLights } from './SpiralLights';
import { TreeMorphState } from '../types';
import { CONFIG, COLORS } from '../constants';

interface ExperienceProps {
  morphState: TreeMorphState;
}

export const Experience: React.FC<ExperienceProps> = ({ morphState }) => {
  
  // --- GEOMETRIES ---
  
  // 1. Heart Geometry (Replaces Needles)
  const heartGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    // Draw a heart shape
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
    shape.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
    shape.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
    shape.bezierCurveTo(x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };
    
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    
    // Rotate -90 on Y so the face of the heart (Z) points to X. 
    // This makes them face 'outward' when placed radially by the instance logic.
    geo.rotateY(-Math.PI / 2);
    // Rotate -10 on X to tilt them slightly back (upward looking)
    geo.rotateX(-0.1);

    geo.scale(0.35, 0.35, 0.35);
    return geo;
  }, []);

  const ornamentGeo = useMemo(() => new THREE.IcosahedronGeometry(0.25, 0), []);
  const starGeo = useMemo(() => new THREE.OctahedronGeometry(0.3, 0), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.3, 0.05, 8, 20), []);

  // --- MATERIALS ---
  // Cyberpunk/Y2K materials
  const needleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.PINE_GREEN,
    roughness: 0.2, // Shinier hearts
    metalness: 0.6,
    emissive: COLORS.PINE_GREEN,
    emissiveIntensity: 0.1,
    flatShading: false
  }), []);

  const ornamentMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: COLORS.BARBIE_PINK,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  }), []);

  const silverMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.SILVER,
    roughness: 0.2,
    metalness: 1.0,
    emissive: COLORS.CYBER_BLUE,
    emissiveIntensity: 0.5,
  }), []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 18]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.5} 
        minDistance={5}
        maxDistance={30}
        autoRotate={morphState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* --- LIGHTING --- */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color={COLORS.CYBER_BLUE} />
      <pointLight position={[-10, 5, -10]} intensity={2} color={COLORS.BARBIE_PINK} />
      <spotLight 
        position={[0, 20, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        color={COLORS.SILVER} 
      />

      {/* --- ENVIRONMENT --- */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {/* A grid floor for the Cyberpunk feel */}
      <gridHelper args={[60, 60, 0x333333, 0x111111]} position={[0, -CONFIG.TREE_HEIGHT/2 - 2, 0]} />

      {/* --- CONTENT --- */}
      <group position={[0, 0, 0]}>
        {/* 1. Hearts (Replaces Needles) */}
        <MorphingInstances
          type="NEEDLE" // Keeping type 'NEEDLE' to preserve the tree distribution logic
          count={CONFIG.PARTICLE_COUNTS.NEEDLES}
          geometry={heartGeo}
          material={needleMat}
          morphState={morphState}
          // Mix of Pine Green, Dark Teal, and a hint of Cyber Blue
          colorPalette={[COLORS.PINE_GREEN, COLORS.PINE_GREEN, '#024a44', '#00cfc1']}
          scaleRange={[0.8, 1.3]}
        />

        {/* 2. Ornaments (Pink/Silver Spheres) */}
        <MorphingInstances
          type="ORNAMENT"
          count={CONFIG.PARTICLE_COUNTS.ORNAMENTS}
          geometry={ornamentGeo}
          material={ornamentMat}
          morphState={morphState}
          colorPalette={[COLORS.BARBIE_PINK, '#FF69B4', COLORS.SILVER]}
          scaleRange={[1.0, 1.5]}
        />

        {/* 3. Special Shapes (Stars, Rings) */}
        <MorphingInstances
          type="SPECIAL"
          count={CONFIG.PARTICLE_COUNTS.SPECIALS}
          geometry={starGeo}
          material={silverMat}
          morphState={morphState}
          colorPalette={[COLORS.CYBER_BLUE, COLORS.SILVER, '#FFFFFF']}
          scaleRange={[1.2, 2.0]}
        />
        
        {/* 4. Planetary Rings */}
         <MorphingInstances
          type="SPECIAL"
          count={30}
          geometry={ringGeo}
          material={ornamentMat}
          morphState={morphState}
          colorPalette={[COLORS.CYBER_BLUE]}
          scaleRange={[1.5, 2.5]}
        />

        {/* 5. Spiral LED Strip */}
        <SpiralLights morphState={morphState} />
      </group>

      {/* --- POST PROCESSING --- */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.4} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <ChromaticAberration 
          offset={new THREE.Vector2(0.002, 0.002)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  );
};