import * as THREE from '../threejs/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../threejs/OrbitControls.js';
import * as TWEEN from '../threejs/tween.module.js';

// init scene, camera, and canvas
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderCanvas = document.getElementById("myCanvas");
//

// set renderspace
const renderer = new THREE.WebGLRenderer( {canvas: renderCanvas, antialias: true } );
const clock = new THREE.Clock();
const clickableObjects = [];
let selectedObject;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.render( scene, camera );
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
const resumeViewer = document.getElementById("pdfContainer");
//

// initialize OrbitControls
const controls = new OrbitControls(camera,renderer.domElement);
controls.maxDistance = 400;
controls.enablePan = false;
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
//

// create & add sun
const sun = new THREE.Mesh( 
    new THREE.SphereGeometry(0.5,16,16), 
    new THREE.MeshBasicMaterial({color: 0xffe600})
);
sun.name = "Sun";
scene.add(sun);
//

// create & add (white->blue) hemisphere light
const light = new THREE.HemisphereLight( 0xffffff, 0x0000ff, 7 );
scene.add( light );

// initialize GLTFLoader
const meshLoader = new GLTFLoader();
//

// create & add resume-satellite
const resumeOrbitSpeed = 0.005;
let satelliteResume, resOrbitLock = new THREE.Group();
meshLoader.load("../public/assets/CV.gltf",
	function ( gltf ) {
        satelliteResume = gltf.scene;
        satelliteResume.children[0].name = "Resume";
        resOrbitLock.add(satelliteResume);
        satelliteResume.position.x = 1;
		scene.add(resOrbitLock);
        clickableObjects.push(satelliteResume);
	},
	function ( xhr ) {loadManager.onProgress(xhr,xhr.loaded,xhr.total);},
	function ( error ) {console.error(error);}
);
//

// create & add contact-satellite
const contactOrbitSpeed = 0.01;
let satelliteContact, conOrbitLock = new THREE.Group();
meshLoader.load("../public/assets/Telephone.gltf",
	function ( gltf ) {
        satelliteContact = gltf.scene;
        satelliteContact.name = "Contacts";
        conOrbitLock.add(satelliteContact);
        satelliteContact.position.x = 2;
		scene.add(conOrbitLock);
        clickableObjects.push(satelliteContact);
	},
	function ( xhr ) {loadManager.onProgress(xhr,xhr.loaded,xhr.total);},
	function ( error ) {console.error(error);}
);
//

// create & add role-satellite
const roleOrbitSpeed = 0.012;
let satelliteRole, roleOrbitLock = new THREE.Group();
meshLoader.load("../public/assets/Personnel.gltf",
	function ( gltf ) {
        satelliteRole = gltf.scene;
        satelliteRole.name = "My Role";
        roleOrbitLock.add(satelliteRole);
        satelliteRole.position.x = 3;
		scene.add(roleOrbitLock);
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

    // vv visualizes fired ray (disabled) vv
    // scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000) );

    if(intersectionAr.length > 0) {
        selectedObject = intersectionAr[0].object.parent;
        infoSelected.innerHTML = selectedObject.name;
        if (selectedObject == satelliteResume.children[0]) resumeViewer.style.visibility = 'visible';
    } else {
        selectedObject = null;
        infoSelected.innerHTML = "Nothing";
        resumeViewer.style.visibility = 'hidden';
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

    if (!(selectedObject == satelliteResume?.children[0])) {
        resOrbitLock.rotation.y += resumeOrbitSpeed;
        satelliteResume.position.y = elevation;
        satelliteResume.lookAt(0,0,0);
    }
    if (!(selectedObject == satelliteContact)) {
        conOrbitLock.rotation.y += contactOrbitSpeed;
        satelliteContact.position.y = elevation;
        satelliteContact.rotation.y += 0.005;
    }
    if (!(selectedObject == satelliteRole)) {
        roleOrbitLock.rotation.y += roleOrbitSpeed;
        satelliteRole.position.y = elevation;
    }

	renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate ); // set animation loop


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.setSize(window.innerWidth / window.innerHeight);
});