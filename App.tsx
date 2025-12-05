import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';
import { TreeMorphState } from './types';

const App: React.FC = () => {
  const [morphState, setMorphState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  return (
    <div className="relative w-full h-screen bg-black">
      <Suspense fallback={null}>
        <Canvas
          shadows
          dpr={[1, 2]} // Handle pixel ratio for sharp rendering
          gl={{ 
            antialias: false, // Post-processing handles smoothing usually, disabling native AA improves performance
            toneMapping: 3, // THREE.ReinhardToneMapping
            toneMappingExposure: 1.5 
          }}
        >
          {/* Main 3D Experience */}
          <Experience morphState={morphState} />
        </Canvas>
      </Suspense>

      {/* Loading Screen */}
      <Loader 
        containerStyles={{ background: '#050505' }}
        innerStyles={{ width: '300px', height: '10px', background: '#333' }}
        barStyles={{ background: '#FF007F', height: '100%' }}
        dataStyles={{ fontFamily: 'Orbitron', color: '#FF007F' }}
      />

      {/* HUD / UI */}
      <UIOverlay morphState={morphState} setMorphState={setMorphState} />
    </div>
  );
};

export default App;
