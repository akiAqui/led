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
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 12.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera and controls setup remains the same...
camera.position.z = 5;
camera.position.x = 100;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const composer = new EffectComposer(renderer);


let geometry  = new THREE.BufferGeometry();
let material  = new THREE.Material();
let mesh      = new THREE.Mesh();

const particlesCnt = 5000;
const posArray = new Float32Array(particlesCnt * 3);
const velocityArray = new Float32Array(particlesCnt * 3);


//
// genRndGeometry
//

function genRndGeometry(){
  const particlesGeometry = new THREE.BufferGeometry();

  for(let i = 0; i < particlesCnt * 3; i += 3) {
    posArray[i    ] = (Math.random() - 0.5) * 140;
    posArray[i + 1] = (Math.random() - 0.5) * 140;
    posArray[i + 2] = (Math.random() - 0.5) * 140;
    
    velocityArray[i] = (Math.random()     - 0.5) * 0.2;
    velocityArray[i + 1] = (Math.random() - 0.5) * 0.2;
    velocityArray[i + 2] = (Math.random() - 0.5) * 0.2;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const colors = new Float32Array(particlesCnt * 3);
  for(let i = 0; i < particlesCnt * 3; i += 3) {
    colors[i    ] = 1.0;
    colors[i + 1] = 1.0; //Math.random() * 0.5;
    colors[i + 2] = 1.0  //Math.random();
  }
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return particlesGeometry;
}


//
// genTorusGeometry
//

function genTorusGeometry(){
  return new THREE.TorusKnotGeometry(20, 4, 100, 3, 2, 1);
}


//
//  canvasにテクスチャを作成
//

function genTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(
    canvas.width  / 2, canvas.height / 2, 0,
    canvas.width  / 2, canvas.height / 2, canvas.width / 2);

//  gradient.addColorStop(0, 'rgba(255,255,255,1)');
//  gradient.addColorStop(0.1, 'rgba(170,248,255,0.3)');
//  gradient.addColorStop(0.2, 'rgba(0,37,97,1)');
//  gradient.addColorStop(1, 'rgba(0,0,0,1)');

  gradient.addColorStop(0,   'rgba(255,255,255,1)');
  gradient.addColorStop(0.1, 'rgba(170,0,255,0.3)');
  gradient.addColorStop(0.2, 'rgba(244,37,0,1)');
  gradient.addColorStop(1,   'rgba(0,0,0,0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/*
function genTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; // サイズを大きく変更
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(170,0,255,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)'); // 境界を滑らかにする

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}
*/


function colorMaterial(){
  const material = new THREE.PointsMaterial({
    size: 0.08,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });
  return material;
}

function textureMaterial(){
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    map: genTexture(),//canvasをmapで渡す
    alphaTest:0.05,
    depthWrite: false
  });
  return material;
}
//
// ジオメトリからTHREE.Pointsの作成
//

function createPointsMesh(geom,material){
  const mesh = new THREE.Points(geom, material);
  return mesh;
}


//
// Animation loop remains the same...
//
/*
function animate(geom,mesh) {
    requestAnimationFrame(animate);
    
    const positions = geom.attributes.position.array as Float32Array;
    for(let i = 0; i < positions.length; i += 3) {
        positions[i    ] += velocityArray[i    ];
        positions[i + 1] += velocityArray[i + 1];
        positions[i + 2] += velocityArray[i + 2];
        
        if (Math.abs(positions[i    ]) > 2.5) velocityArray[i    ] *= -1;
        if (Math.abs(positions[i + 1]) > 2.5) velocityArray[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 2.5) velocityArray[i + 2] *= -1;
    }
    geom.attributes.position.needsUpdate = true;
    
    mesh.rotation.y += 0.001;
    
    controls.update();
    composer.render();
}
*/

function animate(geom: THREE.BufferGeometry, mesh: THREE.Points) {
    if (!geom.attributes.position) {
        console.error("Error: 'position' attribute is missing in geometry.");
        return;
    }

    const positions = geom.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i    ] += velocityArray[i    ];
        positions[i + 1] += velocityArray[i + 1];
        positions[i + 2] += velocityArray[i + 2];

        if (Math.abs(positions[i    ]) > 70) velocityArray[i    ] *= -1;
        if (Math.abs(positions[i + 1]) > 70) velocityArray[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 70) velocityArray[i + 2] *= -1;
    }
    geom.attributes.position.needsUpdate = true;

    mesh.rotation.y += 0.001;

    controls.update();
    composer.render();

    requestAnimationFrame(() => animate(geom, mesh));
}





function postprocess(){
  // Post-processing setup with postprocessing library
  composer.addPass(new RenderPass(scene, camera));

  // Add bloom effect using postprocessing library
  const bloomEffect = new BloomEffect({
    intensity: 1.5,
    luminanceThreshold: 0.05,
    luminanceSmoothing: 1.0,
  });
  const bloomPass = new EffectPass(camera, bloomEffect);
  composer.addPass(bloomPass);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}


/*
function lp(){
  console.log("Position:", particlesMesh.position);
  console.log("Scale:",    particlesMesh.scale);
  console.log("Size:",     particlesMaterial.size);
  console.log("Color:",    particlesMaterial.color);
}

// 簡単な変更関数
function up(size?: number, 
            color?: THREE.Color, 
            position?: THREE.Vector3) {
  if (size) particlesMaterial.size = size;
  if (color) particlesMaterial.color = color;
  if (position) particlesMesh.position.copy(position);
  particlesMaterial.needsUpdate = true; // 変更を反映
}


(window as any).particlesMesh     = particlesMesh;
(window as any).particlesMaterial = particlesMaterial;
(window as any).lp = lp;
(window as any).up = up;
*/

window.addEventListener('resize', onWindowResize, false);



function genScene(){
  geometry  = genRndGeometry();
  // material  = colorMaterial();
  
  //geometry  = genTorusGeometry();
  geometry.deleteAttribute( 'uv' );
  material  = textureMaterial();
  mesh      = createPointsMesh(geometry,material);
  scene.add(mesh);  
  postprocess();  

}

genScene();
animate(geometry,mesh);
