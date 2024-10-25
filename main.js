import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import fragmentShader from './src/shaders/sphere/fragment.js';
import vertexShader from './src/shaders/sphere/vertex.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 2;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// Ajouter une texture
const loader = new THREE.TextureLoader()
const texture1 = await loader.loadAsync("src/img/fire.png")
const texture2 = await loader.loadAsync("src/img/wall.png")
const transitionTexture1 = await loader.loadAsync("src/img/transition1.png");

texture1.wrapS = THREE.RepeatWrapping
texture1.wrapT = THREE.RepeatWrapping
texture2.wrapS = THREE.RepeatWrapping
texture2.wrapT = THREE.RepeatWrapping
transitionTexture1.wrapS = THREE.RepeatWrapping;
transitionTexture1.wrapT = THREE.RepeatWrapping;

/**
 * Plane
 */
const geometry = new THREE.PlaneGeometry(30, 20, 10 );
const planeMaterial = new THREE.ShaderMaterial( {
    uniforms: {
        uColor: new THREE.Uniform(new THREE.Color(0x0088FF)),
        uTexture1: new THREE.Uniform(texture1),
        uTexture2: new THREE.Uniform(texture2),
        uTransition: { value: 0.0 },
        uTransitionTexture: { value: transitionTexture1 },
        uTime: { value: 0 },
        uStrength: { value: 0.05 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true
} );
const plane = new THREE.Mesh( geometry, planeMaterial );
plane.position.z = -8;
scene.add( plane );

/**
 * Animation GSAP
 */
let gsapAnimation;

function startAnimation() {
    if (!gsapAnimation) {
        gsapAnimation = gsap.to(planeMaterial.uniforms.uTransition, {
            value: 1.0,
            duration: 2,
            yoyo: false,
            ease: "power2.inOut",
            onComplete: cycleTexture,
            paused: true
        });
    }
    gsapAnimation.play();
}

function stopAnimation() {
    if (gsapAnimation) {
        gsapAnimation.pause();
    }
}

/**
 * lil-gui Setup
 */
const gui = new lil.GUI();

const params = {
    transition: 0.0,
    strength: 0.02,
    autoAnimate: false,
    startAnimation: function() {
        startAnimation();
    },
    stopAnimation: function() {
        stopAnimation();
    }
};

// Add slider for manual transition control
gui.add(params, 'transition', 0, 1).onChange(value => {
    planeMaterial.uniforms.uTransition.value = value;
});

// Add slider for strength control
gui.add(params, 'strength', 0, 2).onChange(value => {
    planeMaterial.uniforms.uStrength.value = value;
});

// Checkbox to toggle auto animation
gui.add(params, 'autoAnimate').name("Auto Animate").onChange(isAnimating => {
    if (isAnimating) {
        startAnimation();
    } else {
        stopAnimation();
    }
});

/**
 * Cycle the textures
 */
let currentTextureIndex = 1;
function cycleTexture() {
    // Pass to the next texture and reset the transition
    currentTextureIndex = currentTextureIndex === 1 ? 2 : 1; // Alternate between texture1 and texture2
    planeMaterial.uniforms.uTexture1.value = currentTextureIndex === 1 ? texture1 : texture2;
    planeMaterial.uniforms.uTexture2.value = currentTextureIndex === 1 ? texture2 : texture1;

    // Reset transition to 0 after cycling
    planeMaterial.uniforms.uTransition.value = 0;
}

let mouseX = 0;
let mouseY = 0;

// Event listener for mouse movement
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

console.log(mouseX);
console.log(mouseY);


function animate() {
	renderer.render( scene, camera );

    gsap.to(plane.position, {
        x: mouseX * 0.5,
        y: mouseY * 0.5,
        duration: 1.0,
        ease: "ease"
    });

    planeMaterial.uniforms.uTime.value += 0.005;

    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate)

// animate()