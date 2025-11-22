
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'RGBELoader'; //https://www.youtube.com/watch?v=zVDnKVG-9mk

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);

camera.position.z = 500;
camera.position.y = 180;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 50;
controls.maxDistance = 1000;
controls.enableDamping = true;
controls.dampingFactor = 1;

//texture loader
const texLoader = new THREE.TextureLoader();
const clockElement = document.getElementById('clock');
const audio = document.getElementById('backgroundMusic');
const volumeSlider = document.getElementById('volumeSlider');

new RGBELoader().load('/PRM-Final-Project/textures/background/nebula.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
});


function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    clockElement.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeString}`;
}

volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
    console.log(audio.volume);
});

//stars
const stars = [];

function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starsAmount = 8000;

    for (let i = 0; i < starsAmount; i++) {

        //random positions
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;

        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(x, y, z);
        stars.push(star);
        scene.add(star);
    }
}

createStars();


const speed = 20;

class Planet {

    //variables
    planetSize;
    color;
    radiusFromSun;
    mesh;

    yAxisOffset; // offset y axis
    xAxisOffset; //offset x axis
    width; // width
    heigh; //height
    duration; //duration
    currentPo = 0;
    curvature = 1.15;
    clock = new THREE.Clock();
    lastTime = performance.now();
    trailPoints = [];
    trail = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    orbitRing;

    //construc
    constructor(planetSize, color, radiusFromSun, duration, BasicMaterial, yAxisOffset, xAxisOffset, width, heigh) {
        this.planetSize = planetSize;
        this.color = color;
        this.radiusFromSun = radiusFromSun;
        this.duration = duration;
        this.yAxisOffset = yAxisOffset;
        this.xAxisOffset = xAxisOffset;
        this.width = width;
        this.heigh = heigh;
        this.currentPo = 0;
        this.lastTime = performance.now();

        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.planetSize, 32, 32),
            BasicMaterial || new THREE.MeshStandardMaterial({ color: this.color })
        );

        scene.add(this.mesh);

        this.orbitRing = this.DrawEllipse();
        scene.add(this.orbitRing);
    }



    Orbit(sun) {

        let percentage = (this.currentPo / this.duration);

        let steep = (Math.pow(percentage, this.curvature) / (Math.pow(percentage, this.curvature) + Math.pow(1 - percentage, this.curvature))) * 360;

        steep = steep * (Math.PI / 180);

        let currentPlanetX = this.width * Math.sqrt(this.radiusFromSun) * Math.cos(steep) + this.xAxisOffset;
        let currentPlanetZ = this.heigh * Math.sqrt(this.radiusFromSun) * Math.sin(steep) + this.yAxisOffset;

        this.mesh.position.set(currentPlanetX, 0, currentPlanetZ);

        this.currentPo += this.calculateSpeed();

        if (percentage >= 1)
            this.currentPo = 0;

    }

    Rotation() {
        this.mesh.rotation.y += 0.001;
    }

    DrawEllipse(segments = 100) {
        const points = [];
        for (let i = 0; i <= segments; i++) {

            let angle = 360 / segments;

            angle = angle * (Math.PI / 180);
            console.log(angle);

            let planetX = this.width * Math.sqrt(this.radiusFromSun) * Math.cos(i * angle) + this.xAxisOffset;
            let planetZ = this.heigh * Math.sqrt(this.radiusFromSun) * Math.sin(i * angle) + this.yAxisOffset;

            console.log(planetX, planetZ);


            points.push(new THREE.Vector3(planetX, 0, planetZ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        return new THREE.LineLoop(geometry, material);

    }



    calculateSpeed() {
        const now = performance.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;
        return delta * speed;
    }
}


//light for the environment so its not too dark 
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);


//sun light
const sunLight = new THREE.PointLight(0xffffff, 50, 1000);
scene.add(sunLight);

//sun -> its not a planet
const sunTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project/textures/sun/sun-color.jpg'),
    emissive: 0xffff00,
    emissiveMap: texLoader.load('/PRM-Final-Project/textures/sun/sun-color.jpg'),
});

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(30, 32, 32),
    sunTexture
);
scene.add(sun);
sun.add(sunLight);
camera.lookAt(sun.position);

//important to simulate the sun moving up
function moveStars() {

    stars.forEach(star => {

        let distance = star.position.distanceTo(camera.position);

        //move only the nearby stars
        if (distance < 300) {
            star.position.y -= 0.1;

            if (star.position.y < -200) {
                star.position.y = 200;
            }
        }
    });
}

const planets = [];

//mercury
const mercuryTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project/textures/mercury/mercury-color.jpg'),
    emissiveMap: texLoader.load('/PRM-Final-Project/textures/mercury/mercury-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 30,
});
const mercury = new Planet(
    1.5,
    0xbfbfbf,
    20,
    88,
    mercuryTexture,
    0,
    8,
    10,
    9
);
planets.push(mercury);

//venus
const venusTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project/textures/venus/venus-color.jpg'),
    emissiveMap: texLoader.load('/PRM-Final-Project/textures/venus/venus-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 50,
});
const venus = new Planet(
    2.9,
    0xffd9b3,
    37,
    225,
    venusTexture,
    0,
    12,
    10,
    9
);
planets.push(venus);




//earth
const earthTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project//textures/earth/earth-color.jpg'),
    emissiveMap: texLoader.load('/PRM-Final-Project//textures/earth/earth-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 30,
});

const earth = new Planet(
    3,
    0x0000ff,
    51,
    365,
    earthTexture,
    0,
    15,
    10,
    9);
planets.push(earth);


//moon
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
);
earth.mesh.add(moon);
scene.add(moon);



//mars
const marsTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project/textures/mars/mars-color.jpg'),
    emissiveMap: texLoader.load('/PRM-Final-Project/textures/mars/mars-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 10,
});
const mars = new Planet(
    2.5,
    0xff0000,
    78,
    687,
    marsTexture,
    0,
    10,
    10,
    9
);
planets.push(mars);

//jupiter
const jupiterTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project/textures/jupiter/jupiter-color.jpg'),
    emissiveMap: texLoader.load('/PRM-Final-Project/textures/jupiter/jupiter-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 10,
});
const jupiter = new Planet(
    20,
    0xffd700,
    268 / 2,
    4333,
    jupiterTexture,
    0,
    25,
    20,
    18
);
planets.push(jupiter);

//saturn
const saturnTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project//textures/saturn/saturn-color.jpg'),
    emissiveMap: texLoader.load('/PRM-Final-Project/textures/saturn/saturn-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 10,
});
const saturn = new Planet(
    9,
    0xf5deb3,
    492 / 2,
    10759,
    saturnTexture,
    0,
    20,
    18,
    16
);
planets.push(saturn);


const ringGeometry = new THREE.TorusGeometry(7, 1, 64, 64);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2;
saturn.mesh.add(ring);
ring.position.set(0, 0, 0);
ring.scale.set(2, 2, 2);
ring.rotation.y += 50;


//uranus
const uranusTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project/textures/uranus/uranus-color.jpg'),
    emissiveMap: texLoader.load('/PRM-Final-Project/textures/uranus/uranus-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 30,
});
const uranus = new Planet(
    7,
    0xadd8e6,
    990 / 2,
    30687,
    uranusTexture,
    0,
    18,
    16,
    14
);
planets.push(uranus);

//neptune
const neptuneTexture = new THREE.MeshStandardMaterial({
    map: texLoader.load('/PRM-Final-Project/textures/neptune/neptune-color.jpg'),
    emissiveMap: texLoader.load('/PRM-Final-Project/textures/neptune/neptune-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 30,
});
const neptune = new Planet(
    6,
    0x00008b,
    1896 / 2,
    60190,
    neptuneTexture,
    0,
    18,
    14,
    12
);
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

    sunTexture.emissiveIntensity = Math.sin(Date.now() * 0.001) * 0.5 + 1;
    sun.rotation.y += 0.001;
    //sun.rotation.x += 0.0005;

    moveStars();

    planets.forEach(planet => {
        planet.Orbit(sun);
        planet.Rotation();
    });

    moon.position.x = earth.mesh.position.x + 0.7 * Math.cos(Date.now() * 0.005);
    moon.position.z = earth.mesh.position.z + 0.7 * Math.sin(Date.now() * 0.005);

    updateClock();

    renderer.render(scene, camera);
}

loop();

addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
