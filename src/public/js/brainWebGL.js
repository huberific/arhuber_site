import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 1000);
const renderer = new THREE.WebGL1Renderer({
    canvas: document.querySelector("#bg")
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);

camera.position.setZ(50);

let brain = null;

const newMaterial = new THREE.MeshPhongMaterial( {
    color: 0xffffff,
    emissive: 0x000000
} );

const loader = new GLTFLoader();
loader.load('/glTF/brain/brain.gltf', function ( gltf ) {
    brain = gltf.scene;
    brain.scale.setScalar(5);
    brain.translateY(-5);
    brain.traverse((o) => {
        if (o.isMesh)
            o.material = newMaterial;
    });
    scene.add( brain );
}, undefined, function ( error ) {
    console.error( error );
});

var lights = [];
lights[0] = new THREE.DirectionalLight( 0xffffff, 1 );
lights[0].position.set( 1, 0, 0 );
lights[1] = new THREE.DirectionalLight( 0x5db4ff, 1 );
lights[1].position.set( 0.75, 1, 0.5 );
lights[2] = new THREE.DirectionalLight( 0xffd852, 1 );
lights[2].position.set( -0.75, -1, 0.5 );
scene.add( lights[0] );
scene.add( lights[1] );
scene.add( lights[2] );

window.addEventListener('resize', onWindowResize, false);

function animate() {
    requestAnimationFrame( animate );
    if (brain !== null) {
        brain.rotation.y += 0.01;
    }
    renderer.clear();
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

animate();