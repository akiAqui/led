import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from 'postprocessing';

// Scene setup remains the same...
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera and controls setup remains the same...
camera.position.z = 5;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Particle setup remains the same...
const particlesGeometry = new THREE.BufferGeometry();
const particlesCnt = 5000;

const posArray = new Float32Array(particlesCnt * 3);
const velocityArray = new Float32Array(particlesCnt * 3);

for(let i = 0; i < particlesCnt * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 5;
    posArray[i + 1] = (Math.random() - 0.5) * 5;
    posArray[i + 2] = (Math.random() - 0.5) * 5;
    
    velocityArray[i] = (Math.random() - 0.5) * 0.02;
    velocityArray[i + 1] = (Math.random() - 0.5) * 0.02;
    velocityArray[i + 2] = (Math.random() - 0.5) * 0.02;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.08,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
});

const colors = new Float32Array(particlesCnt * 3);
for(let i = 0; i < particlesCnt * 3; i += 3) {
  colors[i] = 1;
  colors[i + 1] = 1.0; //Math.random() * 0.5;
    colors[i + 2] = 1.0 //Math.random();
}
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Post-processing setup with postprocessing library
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Add bloom effect using postprocessing library
const bloomEffect = new BloomEffect({
    intensity: 1.5,
    luminanceThreshold: 0.05,
    luminanceSmoothing: 1.0,
});
const bloomPass = new EffectPass(camera, bloomEffect);
composer.addPass(bloomPass);

// Animation loop remains the same...
function animate() {
    requestAnimationFrame(animate);
    
    const positions = particlesGeometry.attributes.position.array as Float32Array;
    for(let i = 0; i < positions.length; i += 3) {
        positions[i] += velocityArray[i];
        positions[i + 1] += velocityArray[i + 1];
        positions[i + 2] += velocityArray[i + 2];
        
        if (Math.abs(positions[i]) > 2.5) velocityArray[i] *= -1;
        if (Math.abs(positions[i + 1]) > 2.5) velocityArray[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 2.5) velocityArray[i + 2] *= -1;
    }
    particlesGeometry.attributes.position.needsUpdate = true;
    
    particlesMesh.rotation.y += 0.001;
    
    controls.update();
    composer.render();
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}


// 簡単な表示関数
function lp(){
  console.log("Position:", particlesMesh.position);
  console.log("Scale:", particlesMesh.scale);
  console.log("Size:", particlesMaterial.size);
  console.log("Color:", particlesMaterial.color);
}

// 簡単な変更関数
function up(
  size?: number, 
  color?: THREE.Color, 
  position?: THREE.Vector3
) {
  if (size) particlesMaterial.size = size;
  if (color) particlesMaterial.color = color;
  if (position) particlesMesh.position.copy(position);
  particlesMaterial.needsUpdate = true; // 変更を反映
}


(window as any).particlesMesh = particlesMesh;
(window as any).particlesMaterial = particlesMaterial;
(window as any).lp = lp;
(window as any).up =up;




animate();
