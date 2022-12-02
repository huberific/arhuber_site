import * as THREE from 'three';
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

function main() {
    const canvas = document.querySelector( '#c' );
    const renderer = new THREE.WebGLRenderer( {canvas} );
    renderer.setClearColor( 0x000000, 0);

    const fov = 75;
    // const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const aspect = 2;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.z = 10;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.lookAt(0,0,0);

    const scene = new THREE.Scene();

    // add lights:
//   {
//     const color = 0x333333;
//     const intensity = 1;
//     const light = new THREE.DirectionalLight( color, intensity );
//     light.position.set(-1, 2, 8);
//     scene.add(light);

//     const lightHelper = new THREE.PointLightHelper ( light );
//     scene.add( lightHelper );
//   }

    const isoRadius = 5;
    const isoDetail = 0;
    const icosahedron = new THREE.IcosahedronGeometry( isoRadius, isoDetail );
    const wireframe = new THREE.WireframeGeometry( icosahedron );

    const lineMat = new THREE.LineBasicMaterial( {
        // light-mode
        // color: 0xA8A8A8,
        // dark-mode
        color: 0x282828,
        depthTest: false,
        opacity: 0.3,
        transparent: true,
        linecap: 'round', //ignored by WebGLRenderer
        linejoin:  'round' //ignored by WebGLRenderer
    } );

//   const newMat = new THREE.MeshPhongMaterial( {
//     color: 0xBBBBBB,
//     polygonOffset: true,
//     polygonOffsetFactor: 1,
//     polygonOffsetUnits: 1
//   } );

//   let newMesh = new THREE.Mesh( icosahedron, newMat );

//   let geo = new THREE.EdgesGeometry( newMesh.geometry );
//   let newMat2 = new THREE.LineBasicMaterial ( { color: 0xffffff });
//   let newWireframe = new THREE.LineSegments( geo, newMat2);
//   newMesh.add ( newWireframe );
//   newMesh.position.set(0, 0, 0);
//   scene.add( newMesh );

    const line = new THREE.LineSegments( wireframe, lineMat );
    line.position.set(7, 7, 0);
    scene.add( line );

    const line2 = new THREE.LineSegments( wireframe, lineMat );
    line2.position.set(-10, -10, 0);
    scene.add( line2 );

    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    const ttfLoader = new TTFLoader();
    const fontLoader = new FontLoader();

    ttfLoader.load('/fonts/Roboto-Light.ttf', (json) => {
        const fontChoice = fontLoader.parse(json);
        const textGeometry = new TextGeometry("Hi, I'm Aaron.", {
            height: 0,
            size: 1,
            font: fontChoice,
        });
        const textMaterial = new THREE.MeshNormalMaterial();
        // textMaterial.wireframe = true;
        // light-mode
        // color: 0xA8A8A8,
        // dark-mode
        textMaterial.color = 0x282828;
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-1 * window.innerWidth/100, 3, 0);
        scene.add(textMesh);
    });


    function render( time ) {
        time *= 0.00002;  // convert time to seconds

        line.rotation.x = -time;
        line.rotation.y = -time;
        line.rotation.z = -time;
        line2.rotation.x = -2 * time;
        line2.rotation.y = -2 * time;
        // newMesh.rotation.x = time;
        // newMesh.rotation.y = time;
        // newMesh.rotation.z = time;


        // to keep it from getting distorted (responsive)
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        if (resizeRendererToDisplaySize( renderer )) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render( scene, camera );

        requestAnimationFrame( render );
    }
    requestAnimationFrame( render );
}

function resizeRendererToDisplaySize( renderer ) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if ( needResize ) {
        renderer.setSize( width, height, false );
    }
    return needResize;
}

main();

