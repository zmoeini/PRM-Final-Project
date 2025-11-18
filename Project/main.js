
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
controls.minDistance = 20;
controls.maxDistance = 250;
//texture loader
const texLoader = new THREE.TextureLoader();


const clockElement = document.getElementById('clock');

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    clockElement.innerHTML = `Time: ${timeString}`;
}

//stars
const stars = [];

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
        stars.push(star);
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
    trailLength;

    trailPoints = [];
    trail = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    orbitRing;

    //construc
    constructor(radius, color, distanceFromSun, speed, trailLength, BasicMaterial) {
        this.radius = radius;
        this.color = color;
        this.distanceFromSun = distanceFromSun;
        this.speed = speed;
        this.trailLength = trailLength;

        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 32, 32),
            BasicMaterial || new THREE.MeshStandardMaterial({ color: this.color })
        );

        scene.add(this.mesh);
        scene.add(this.trail);

        this.orbitRing = new THREE.Mesh(
            new THREE.TorusGeometry(distanceFromSun, 0.2, 2, 100),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5})
        );
        this.orbitRing.rotation.x = Math.PI / 2;
        scene.add(this.orbitRing);
    }



    Orbit(sun) {
        this.mesh.position.x = this.distanceFromSun * Math.cos(Date.now() * this.speed);
        this.mesh.position.z = this.distanceFromSun * Math.sin(Date.now() * this.speed);
        this.mesh.position.y = sun.position.y;
        //this.Trail();
    }

    Rotation() {
        this.mesh.rotation.y += 0.001;
    }

    Trail() {

        this.trailPoints.push(this.mesh.position.clone());

        if (this.trailPoints.length > this.trailLength) {
            this.trailPoints.shift();
        }

        this.trail.geometry.setFromPoints(this.trailPoints);
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
    map: texLoader.load('/textures/sun/sun-color.jpg'),
    emissive: 0xffff00,
    emissiveMap: texLoader.load('/textures/sun/sun-color.jpg'),
});

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    sunTexture
);
scene.add(sun);
sun.add(sunLight);
camera.lookAt(sun.position);

//important to simulate the sun moving up
function moveStars(){
   
    stars.forEach(star => {
        
        let distance = star.position.distanceTo(camera.position);
        
        //move only the nearby stars
        if(distance < 300){
            star.position.y -= 0.1;

            if(star.position.y < -200){
                star.position.y = 200;
            }
        }       
    });
}


const planets = [];

//mercury
const mercuryTexture = new THREE.MeshStandardMaterial({  
    map: texLoader.load('/textures/mercury/mercury-color.jpg'),
    emissiveMap: texLoader.load('/textures/mercury/mercury-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 30,
});
const mercury = new Planet(1, 0xaaaaaa, 15, 0.002, 50);
planets.push(mercury);

//venus
const venusTexture = new THREE.MeshStandardMaterial({  
    map: texLoader.load('/textures/venus/venus-color.jpg'),
    emissiveMap: texLoader.load('/textures/venus/venus-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 50,
});
const venus = new Planet(2, 0xffa500, 20, 0.0015, 60, venusTexture);
planets.push(venus);

//earth
const earthTexture = new THREE.MeshStandardMaterial({  
    map: texLoader.load('/textures/earth/earth-color.jpg'),
    emissiveMap: texLoader.load('/textures/earth/earth-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 30,
});
const earth = new Planet(3, 0x0000ff, 30, 0.0007, 100, earthTexture);
planets.push(earth);


//moon
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
);
scene.add(moon);

//mars
const marsTexture = new THREE.MeshStandardMaterial({  
    map: texLoader.load('/textures/mars/mars-color.jpg'),
    emissiveMap: texLoader.load('/textures/mars/mars-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 10,
});
const mars = new Planet(2.5, 0xff0000, 40, 0.0005, 120, marsTexture);
planets.push(mars);

//jupiter
const jupiterTexture = new THREE.MeshStandardMaterial({  
    map: texLoader.load('/textures/jupiter/jupiter-color.jpg'),
    emissiveMap: texLoader.load('/textures/jupiter/jupiter-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 10,
});
const jupiter = new Planet(5, 0xffd700, 55, 0.0003, 150, jupiterTexture);
planets.push(jupiter);

//saturn
const saturnTexture = new THREE.MeshStandardMaterial({  
    map: texLoader.load('/textures/saturn/saturn-color.jpg'),
    emissiveMap: texLoader.load('/textures/saturn/saturn-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 10,
});
const saturn = new Planet(4.5, 0xf5deb3, 70, 0.0002, 300, saturnTexture);
planets.push(saturn);


const ringGeometry = new THREE.TorusGeometry(7, 1, 64, 64);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2;
saturn.mesh.add(ring);

//uranus
const uranusTexture = new THREE.MeshStandardMaterial({  
    map: texLoader.load('/textures/uranus/uranus-color.jpg'),
    emissiveMap: texLoader.load('/textures/uranus/uranus-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 30,
});
const uranus = new Planet(4, 0xadd8e6, 85, 0.0001, 400);
planets.push(uranus);

//neptune
const neptuneTexture = new THREE.MeshStandardMaterial({  
    map: texLoader.load('/textures/neptune/neptune-color.jpg'),
    emissiveMap: texLoader.load('/textures/neptune/neptune-color.jpg'),
    emissive: 0x222222,
    emissiveIntensity: 30,
});
const neptune = new Planet(3.5, 0x00008b, 100, 0.00009, 500, neptuneTexture);
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
    /*
    moon.position.x = earth.position.x + 0.7 * Math.cos(Date.now() * 0.005);
    moon.position.z = earth.position.z + 0.7 * Math.sin(Date.now() * 0.005);
    */

    planets.forEach(planet => {
        planet.Orbit(sun);
        planet.Rotation();
    });

    updateClock();

    renderer.render(scene, camera);
}

loop();

addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
