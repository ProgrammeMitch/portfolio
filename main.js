//ADD IMPORTS
import * as THREE from 'three';
import gsap from 'gsap';
import WebGL from 'three/addons/capabilities/WebGL.js';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

//CONSTANTS
const colors = ['white', 'yellow', 'red'];
const particles = new THREE.Group();
const width = window.innerWidth;
const height = window.innerHeight;

//CREATE A SCENE OR WORLD USING THE THREE.Scene
const scene = new THREE.Scene();

//THEN YOU USE A CAMERA TO VIEW THE SCENE. THE CAMERA TAKES A FEW PARAMETERS (FIELD OF VIEW, ASPECT RATIO, NEAREST POSITION, FARTHEST POSITION )
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//NOW THAT WE HAVE A SCENE, WE HAVE TO RENDER THE IMAGE TO OUR DOM ELEMENT
const renderer = new THREE.WebGLRenderer({
	antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0E2255);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

//WITH THE SCENE, CAMERA AND RENDERER IN PLACE - WE CAN CREATE OBJECTS
//EVERY OBJECT IS MESH COMNIBATION OF A GEOMETRY AND MESH MATERIAL
const geometry = new THREE.SphereGeometry(92.5, 50, 50);

/**const material = new THREE.MeshPhongMaterial( { 
	map: new THREE.TextureLoader().load('./images/globe.jpg'), 
	shading: THREE.FlatShading } );*/

const material = new THREE.ShaderMaterial({
	vertexShader,
	fragmentShader,
	uniforms: {
		globeTexture: {
			value: new THREE.TextureLoader().load('./images/globe.jpg')
		}
	}
})
const globe = new THREE.Mesh(geometry, material);
globe.castShadow = true;
globe.receiveShadow = true;
globe.position.set(0, 40, 0);

//SOME MATERIAL OR MESH TYPES NEED LIGHT TO SHINE

const light = new THREE.DirectionalLight();
light.position.set(50, 100, 20);
light.castShadow = true;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;

//SET THE FINAL CAMERA POSITION
camera.lookAt(scene.position);
camera.position.z = 250;

//THE NEXT LINES OF CODE ALLOWS THE USER INTERACT WIT THE SCENE
document.getElementById("wed-dev").addEventListener("mouseover", () => {
	renderer.setClearColor(0x0E2255)
})

document.getElementById("SC-writer").addEventListener("mouseover", () => {
	renderer.setClearColor(0x0E2255)
})

document.getElementById("tech-writer").addEventListener("mouseover", () => {
	renderer.setClearColor(0x0E2255)
})

document.getElementById("research-scripts").addEventListener("mouseover", () => {
	renderer.setClearColor('black');
})

document.getElementById("technical-scripts").addEventListener("mouseover", () => {
	renderer.setClearColor('green');
})

document.getElementById("web-apps").addEventListener("mouseover", () => {
	renderer.setClearColor('skyblue');
})

window.addEventListener('resize', onResize);

//WE CAN ALSO MANIPULATE OBJECTS USING MOUSE MOVEMENT
const mouse = { x: undefined, y: undefined };

addEventListener('mousemove', () => {
	mouse.x = (event.clientX / innerWidth) * 2 - 1,
		mouse.y = (event.clientX / innerWidth) * 2 + 1
})

const group = new THREE.Group();
group.add(globe);

//ADD THE CREATED OBJECTS TO THE SCENE
scene.add(group);
scene.add(light);
drawParticles();
populateStars();
blueAtmosphere()

//WITH OBJECTS IN PLACE - WE CAN DO SOME ANIMATION
function animate() {
	requestAnimationFrame(animate);

	particles.rotation.x += 0.001;
	particles.rotation.y -= 0.004;

	globe.rotation.y += 0.005;

	//WE CAN DELAY ANIMATION USING GSAP
	gsap.to(group.rotation, {
		x: -mouse.y * 0.2,
		y: mouse.x * 0.4,
		duration: 1
	})

	//Add motion to the camera
	if (camera.position.z < 600) {
		camera.position.z += 1;
	}

	renderer.render(scene, camera);
}

function drawParticles() {

	scene.add(particles);
	const geometry = new THREE.TetrahedronGeometry(10, 0);

	for (let i = 0; i < 10; i++) {
		const material = new THREE.MeshPhongMaterial({
			color: colors[Math.floor(Math.random() * colors.length)],
			shading: THREE.FlatShading
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set((Math.random() - 0.5) * 1000,
			(Math.random() - 0.5) * 1000,
			(Math.random() - 0.5) * 1000);
		mesh.updateMatrix();
		mesh.matrixAutoUpdate = false;
		particles.add(mesh);
	}
}

function populateStars() {
	const starGeometry = new THREE.BufferGeometry();
	const starMaterial = new THREE.PointsMaterial({
		color: 0xffffff
	})

	const starPosition = [];
	for (let i = 0; i < 10000; i++) {
		const x = (Math.random() - 0.5) * 2000
		const y = (Math.random() - 0.5) * 2000
		const z = -Math.random() * 3000
		starPosition.push(x, y, z)
	}

	starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPosition, 3))

	const stars = new THREE.Points(starGeometry, starMaterial)

	scene.add(stars)
}

function blueAtmosphere() {
	//ATMOSPHERE AROUND THE GLOBE
	const atmosphereGeometry = new THREE.SphereGeometry(92.5, 50, 50);
	const atmosphereMaterial = new THREE.ShaderMaterial({
		vertexShader: atmosphereVertexShader,
		fragmentShader: atmosphereFragmentShader,
		blending: THREE.AdditiveBlending,
		side: THREE.BackSide
	})
	const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

	//SET ATMOSPHERE POSITION
	atmosphere.scale.set(1.1, 1.1, 1.1);
	atmosphere.position.set(0, 40, 0);

	scene.add(atmosphere);
}

function onResize() {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}

//CHECK IF THE BROWSER IS COMPATIBLE BEFORE CALLING ANIMATE FUNCTION
if (WebGL.isWebGLAvailable()) {
	// Initiate function or other initializations here
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);
}