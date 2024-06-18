import * as THREE from '../threejs/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../threejs/OrbitControls.js';

// init scene, camera, and canvas
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderCanvas = document.getElementById("myCanvas");
//

// set renderspace
const renderer = new THREE.WebGLRenderer( {canvas: renderCanvas, antialias: true } );
const clock = new THREE.Clock();
const clickableObjects = [];
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate ); // set animation loop
//

// initialize LoadingManager and loadingIndicator
const loadManager = new THREE.LoadingManager();
const barContainer = document.getElementById("progressBarContainer");
const barIndicator = document.getElementById("progressBar");
loadManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    renderCanvas.style.filter = 'blur(4px)';
    barContainer.style.visibility = 'visible';
    barIndicator.style.visibility = 'visible';
};
loadManager.onProgress = function ( item, loaded, total ) {
    barIndicator.style.width = (loaded / total * 100) + '%';
};
loadManager.onLoad = function () {
    renderCanvas.style.filter = 'none';
    barContainer.style.visibility = 'hidden';
    barIndicator.style.visibility = 'hidden';
};
//

// initialize Overlay Elements
const infoSelected = document.getElementById("elementSelected");
//

// initialize OrbitControls
const controls = new OrbitControls(camera,renderer.domElement);
controls.maxDistance = 400;
//

// create & add environment sphere
let envGeometry = new THREE.SphereGeometry( 500, 32, 32 );
envGeometry.scale( -1, 1, 1 );

var material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color("rgb(243,188,245)")
      },
      color2: {
        value: new THREE.Color("rgb(192,223,255)")
      }
    },
    vertexShader: `
      varying vec2 uvVector;
  
      void main() {
        uvVector = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 uvVector;
      
      void main() {
        
        gl_FragColor = vec4(mix(color1, color2, uvVector.y), 1.0);
      }
    `
});
const largeSphere = new THREE.Mesh( envGeometry, material );
largeSphere.name = "envSphere";
scene.add( largeSphere );

// create & add sun
const sun = new THREE.Mesh( 
    new THREE.SphereGeometry(0.5,16,16), 
    new THREE.MeshBasicMaterial({color: 0xffe600})
);
sun.name = "Sun";
scene.add(sun);
clickableObjects.push(sun);
//

// create & add (white->blue) hemisphere light
const light = new THREE.HemisphereLight( 0xffffff, 0x0000ff, 7 );
scene.add( light );

// initialize GLTFLoader
const meshLoader = new GLTFLoader();
//

// create & add resume-satellite
const resumeOrbitSpeed = 0.2;
let satelliteResume = new THREE.Group();
meshLoader.load("../public/assets/CV.gltf",
	function ( gltf ) {
        satelliteResume = gltf.scene;
        satelliteRole.name = "Resume";
		scene.add(satelliteResume);
        clickableObjects.push(satelliteResume);
	},
	function ( xhr ) {loadManager.onProgress(xhr,xhr.loaded,xhr.total);},
	function ( error ) {console.error(error);}
);
//

// create & add contact-satellite
const contactOrbitSpeed = 0.5;
let satelliteContact = new THREE.Group();
meshLoader.load("../public/assets/Telephone.gltf",
	function ( gltf ) {
        satelliteContact = gltf.scene;
        satelliteRole.name = "Contacts";
		scene.add(satelliteContact);
        clickableObjects.push(satelliteContact);
	},
	function ( xhr ) {loadManager.onProgress(xhr,xhr.loaded,xhr.total);},
	function ( error ) {console.error(error);}
);
//

// create & add role-satellite
const roleOrbitSpeed = 0.6;
let satelliteRole = new THREE.Group();
meshLoader.load("../public/assets/Personnel.gltf",
	function ( gltf ) {
        satelliteRole = gltf.scene;
        /*
        let boundingBox = new THREE.Mesh(
            new THREE.BoxGeometry(3,7,3),
            new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true})
        );
        boundingBox.position.y = 3;
        satelliteRole.add(boundingBox);
        */
        satelliteRole.name = "My Role";
		scene.add(satelliteRole);
        clickableObjects.push(satelliteRole);
	},
	function ( xhr ) {loadManager.onProgress(xhr,xhr.loaded,xhr.total);},
	function ( error ) {console.error(error);}
);
//

// create & add rings
const rings = []
for (let i = 1; i <= 3; i++) {
    rings.push(new THREE.Mesh(
        new THREE.RingGeometry(i,i+0.05,64),
        new THREE.MeshBasicMaterial({color: 0xffe1fc, wireframe: false, side: THREE.DoubleSide})
    ));
};
rings.forEach((ring) => {
    ring.rotation.x = Math.PI/2;
    scene.add(ring);
});
//

// set camera position and update OrbitControl
camera.position.set( 0, 1, 4 );
camera.lookAt(0,0,0);
controls.update();
//


// create 'click' event listener
const clickClock = new THREE.Clock();
["mousedown","mouseup"].forEach((e) => {
    document.addEventListener(e,  onClickAndRelease, false);
});

function onClickAndRelease(e) {
    if (e.type === "mousedown") {
        clickClock.getDelta();
    } else if (e.type === "mouseup") {
        if (clickClock.getDelta() <= 0.5) rayOnMouseEvent(e);
    }
}
//

// raycast to determine object under mouse when event fires
function rayOnMouseEvent(event) {
    const raycaster =  new THREE.Raycaster();
    const clickLoc = new THREE.Vector2(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        -( event.clientY / window.innerHeight ) * 2 + 1
    );
    raycaster.setFromCamera( clickLoc, camera );

    const intersectionAr = raycaster.intersectObjects(clickableObjects,true);

    // vv visualizes fired ray vv
    scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000) );

    if(intersectionAr.length > 0) {
        infoSelected.innerHTML = intersectionAr[0].object.name;
    }
}
//


// get current coords for orbit around (0,0,0) based on time constant
function getOrbitPathCoords(axis, radius, time, speed) {
    if (axis.toLowerCase() !== "x" && axis.toLowerCase() !== "z") {
        throw new Error("Invalid axis provided (valid: 'x' or 'z')");
    }
    return ( radius * ((axis === "x" )?(Math.cos(time*speed)):(Math.sin(time*speed))) );
}
//

function animate() {

	sun.rotation.x += 0.01;
	sun.rotation.y += 0.01;

    let elevation = (Math.sin(clock.getElapsedTime())/10)+0.1;

    satelliteResume.position.set(
        getOrbitPathCoords("x",1,clock.getElapsedTime(),resumeOrbitSpeed),
        elevation,
        getOrbitPathCoords("z",1,clock.getElapsedTime(),resumeOrbitSpeed)
    );
    satelliteContact.position.set(
        getOrbitPathCoords("x",2,clock.getElapsedTime(),contactOrbitSpeed),
        elevation,
        getOrbitPathCoords("z",2,clock.getElapsedTime(),contactOrbitSpeed)
    );
    satelliteRole.position.set(
        getOrbitPathCoords("x",3,clock.getElapsedTime(),roleOrbitSpeed),
        elevation,
        getOrbitPathCoords("z",3,clock.getElapsedTime(),roleOrbitSpeed)
    );

    satelliteResume.lookAt(0,0,0);
    satelliteContact.rotation.y += 0.005;

	renderer.render( scene, camera );
}