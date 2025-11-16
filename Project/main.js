
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100;
camera.position.y = 20;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//controls
const controls = new OrbitControls(camera, renderer.domElement);

//stars
function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starsAmount = 5000;

    for (let i = 0; i < starsAmount; i++) {

        //random positions
        const x = (Math.random() - 0.5) * 500;
        const y = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;

        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(x, y, z);
        scene.add(star);
    }
}

createStars();
 

class Planet {

    //variables
    radius;
    color;
    distanceFromSun;
    speed;
    mesh;

    //construc
    constructor(radius, color, distanceFromSun, speed) {
        this.radius = radius;
        this.color = color;
        this.distanceFromSun = distanceFromSun;
        this.speed = speed;

        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 32, 32),
            new THREE.MeshStandardMaterial({ color: this.color })
        );

        scene.add(this.mesh);
    }

    Orbit() {
        this.mesh.position.x = this.distanceFromSun * Math.cos(Date.now() * this.speed);
        this.mesh.position.z = this.distanceFromSun * Math.sin(Date.now() * this.speed);
    }
}


//light for the environment so its not too dark 
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);


//sun light
const sunLight = new THREE.PointLight(0xffffff, 50, 1000);
scene.add(sunLight);

//sun -> its not a planet
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 1 })
);
scene.add(sun);
camera.lookAt(sun.position);

const planets = [];

//mercury
const mercury = new Planet(1, 0xaaaaaa, 15, 0.002);
planets.push(mercury);

//venus
const venus = new Planet(2, 0xffa500, 20, 0.0015);
planets.push(venus);
//mars

//earth
const earth = new Planet(3, 0x0000ff, 30, 0.0007);
planets.push(earth);

//moon
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
);
scene.add(moon);

//mars
const mars = new Planet(2.5, 0xff0000, 40, 0.0005);
planets.push(mars);

//jupiter
const jupiter = new Planet(5, 0xffd700, 55, 0.0003);
planets.push(jupiter);

//saturn
const saturn = new Planet(4.5, 0xf5deb3, 70, 0.0002);
planets.push(saturn);

const ringGeometry =new THREE.TorusGeometry(7, 1, 64, 64);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2;
saturn.mesh.add(ring);

//uranus
const uranus = new Planet(4, 0xadd8e6, 85, 0.0001);
planets.push(uranus);

//neptune
const neptune = new Planet(3.5, 0x00008b, 100, 0.00009);
planets.push(neptune);



/*

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


addEventListener('click', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const hit = raycaster.intersectObjects([sun, venus, moon, mars])[0];
    if (hit) {

     
    }
});
*/

function loop() {
    requestAnimationFrame(loop);


    /*
    moon.position.x = earth.position.x + 0.7 * Math.cos(Date.now() * 0.005);
    moon.position.z = earth.position.z + 0.7 * Math.sin(Date.now() * 0.005);
    */

    planets.forEach(planet => {
        planet.Orbit();
    });

    renderer.render(scene, camera);
}

loop();

addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
