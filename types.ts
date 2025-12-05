import * as THREE from 'three';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  // The random position in the cloud
  scatterPosition: THREE.Vector3;
  scatterRotation: THREE.Euler;
  
  // The ordered position on the tree cone
  treePosition: THREE.Vector3;
  treeRotation: THREE.Euler;
  
  // Random phase for floating animation
  phase: number;
  speed: number;
}

export interface MorphingGroupProps {
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  morphState: TreeMorphState;
  colorPalette: string[];
  scaleRange: [number, number];
  type: 'NEEDLE' | 'ORNAMENT' | 'SPECIAL';
}
