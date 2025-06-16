import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

var scene, camera, renderer, controls;
var texture, geometry, material;
var planets = [], moons = [], orbits = [];
var timestamp = 0, speedFactor = 0.005;
var asteroidBelt1, asteroidBelt2, spaceship;

// Controla si se muestra las órbitas
var showOrbits = true;  

// Movimiento de la cámara
var currentPlanet = null;      
var previousMousePosition = { x: 0, y: 0 };
var isZooming = false, isDragging = false;     
var cameraOffset = new THREE.Vector3(0, 1, 5); 

// Indica si la vista actual es en perspectiva
var isPerspectiveView = false;

// Para la interacción con la escena
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// Movimiento de un ovni
var moveForward = false, moveBackward = false;
var moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
var rotateSceneLeft = false, rotateSceneRight = false;
var spaceshipSpeed = 0.1, rotationSpeed = 0.05, cameraAngle = 0;

// Variables para detectar colisión si usa el ovni
var spaceshipCollisionRadius = 1, planetCollisionRadius = 1;
var collisionMargin = 1.5; // Distancia de margen para evitar colisiones

// Distancia desde la cámara hasta el planeta seleccionado
var cameraOffsetDistance = 5;

// Variable para controlar la visibilidad de un cuadro de texto (manual de instrucciones)
var isControlTextVisible = true;

init();
animationLoop();


function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Añadir controles de órbita
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Añadir luz ambiental
    var ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
  
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', onClickPlanet);

    // Mostrar el ovni
    createSpaceship();
  
    // Mostrar el fondo para la escena
    createBackground('https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/space.jpg?v=1729446126118');

    // Mostrar el Sol
    createStar('https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Sun.jpg?v=1729436568171');

    // Mostrar los planetas con sus distancias, velocidades y texturas
    createPlanet('Mercurio', 0.4, 5, 1.2, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Mercury.jpg?v=1729436285497');
    createPlanet('Venus', 0.9, 7, 1.4, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Venus.jpg?v=1729436583346');
    
    createPlanet('Tierra', 1, 10, 1.7, 
      'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Earth_daymap.jpg?v=1729449317595', // Textura de día
      'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Earth_nightmap.jpg?v=1729449317595' // Textura de noche
    );
  
    createPlanet('Marte', 0.53, 15, 2, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Mars.jpg?v=1729436278631');
    createPlanet('Júpiter', 2.5, 27, 1, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Jupiter.jpg?v=1729436273004');
    createPlanet('Saturno', 2.2, 35, 0.8, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Saturn.jpg?v=1729436542493');
    createPlanet('Urano', 1.7, 40, 0.6, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Uranus.jpg?v=1729436577097');
    createPlanet('Neptuno', 1.6, 45, 0.5, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Neptuno.jpg?v=1729787836873');
    createPlanet('Plutón', 0.3, 50, 0.4, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Pluto.jpg?v=1729436536298');

    // Mostrar la luna a la Tierra
    createMoon(planets[2], 0.27, 2, 1, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Moon.jpg?v=1729436293806');

    // Mostrar las lunas a Marte
    createMoon(planets[3], 0.1, 2, 1.5, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Phobos.jpg?v=1729436293806'); // Fobos
    createMoon(planets[3], 0.1, 3, 1.2, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Deimos.jpg?v=1729436293806'); // Deimos
  
    // Mostrar el cinturón de asteroides entre Marte y Júpiter
    asteroidBelt1 = createAsteroidBelt(20, 22, 300, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/asteroid.jpg?v=1729458279095');
    // Mostrar el cinturón de Kuiper fuera de Neptuno  
    asteroidBelt2 = createAsteroidBelt(53, 58, 500, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/asteroid.jpg?v=1729458279095');

    // Mostrar el satélite
    createSatelliteWithAntenna(planets[2], 0.2, 1.5, 0.1, 'https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/metal-satelite.png?v=1731265533480');
    
    // Cargar el archivo CSV y procesarlo
    fetch("datos.csv")
      .then((response) => {
        if (!response.ok) { throw new Error("Error: " + response.statusText); }
        return response.text();
      })
      .then((content) => { procesarCSVDatos(content); })
      .catch((error) => { console.error("Error al cargar el archivo:", error); });
  
    // Función para procesar el archivo CSV
    function procesarCSVDatos(content) {
        const sep = ";";
        const filas = content.split("\n");
        const encabezados = filas[0].split(sep);

        const indices = {
            ciudad: encabezados.indexOf("Ciudad"),
            latitud: encabezados.indexOf("Latitud"),
            longitud: encabezados.indexOf("Longitud"),
            continente: encabezados.indexOf("Continente"),
            temperaturaMedia: encabezados.indexOf("Temperatura_Media"),
            tipoDeClima: encabezados.indexOf("Tipo_de_Clima"),
        };

        // Se itera sobre las filas de datos y añade contenido de datos a la Tierra
        for (var i=1; i < filas.length; i++) {
            const fila = filas[i].split(sep);
            if (fila.length < encabezados.length) continue; // Evitar filas incompletas
            const nombreCiudad = fila[indices.ciudad];
            const lat = parseFloat(fila[indices.latitud]);
            const lon = parseFloat(fila[indices.longitud]);
            const temperatura = parseFloat(fila[indices.temperaturaMedia]);
            const clima = fila[indices.tipoDeClima];

            // Se convierte las coordenadas geográficas a coordenadas 3D
            const coordenadas3D = latLonToXYZ(lat, lon, 1.3);

            // Se mapea el clima a un ícono (Soleado, lluvia, nublado, etc.)
            const climaIcono = mappingClimate(clima);
            createWeatherIcon(coordenadas3D, climaIcono, nombreCiudad, temperatura);
        }
    } 
}

// -------------------------------------------------



// Función para convertir latitud y longitud a coordenadas 3D
function latLonToXYZ(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);      // Latitud a radianes
    const theta = (lon + 180) * (Math.PI / 180);   // longitud a radianes
  
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
}

// Función para crear un satélite con antena
function createSatelliteWithAntenna(planet, radius, distance, speed, textureURL) {
    geometry = new THREE.CylinderGeometry(0.4, 0.1, 0.8, 32);
    texture = new THREE.TextureLoader().load(textureURL);
    material = new THREE.MeshStandardMaterial({ map: texture });
    var satelliteBody = new THREE.Mesh(geometry, material);

    // Se configura la distancia y la velocidad
    satelliteBody.userData = { distance: distance, speed: speed, rotationSpeed: 0.01 };
    satelliteBody.position.set(distance, 0, 0);

    // Se inclina el satélite en el eje X y Z
    satelliteBody.rotation.x = THREE.MathUtils.degToRad(30);
    satelliteBody.rotation.z = THREE.MathUtils.degToRad(85);

    // Se configura el tamaño de un satélite
    satelliteBody.scale.set(0.4, 0.4, 0.4);

    // Se añade el satélite al planeta junto con la órbita
    planet.add(satelliteBody);
    createOrbit(distance, satelliteBody);
    createSatelliteAntenna(satelliteBody);
    createSolarPanels(satelliteBody);
}

// Función para crear la antena del satélite
function createSatelliteAntenna(satelliteBody) {
    geometry = new THREE.ConeGeometry(0.1, 0.8, 32);
    texture = new THREE.TextureLoader().load('https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/antena-satelite.png?v=1731265373933');
    material = new THREE.MeshStandardMaterial({ map: texture });
  
    var antenna = new THREE.Mesh(geometry, material);
    antenna.position.set(0, 0.5, 0);
    satelliteBody.add(antenna);
}

// Función para crear los paneles solares del satélite
function createSolarPanels(satelliteBody) {
    geometry = new THREE.BoxGeometry(1, 0.05, 0.3);
    texture = new THREE.TextureLoader().load('https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/solares-paneles.png?v=1731265306047');
    material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    var panel = new THREE.Mesh(geometry, material);

    // Se coloca dos paneles solares a los lados del satélite
    panel.position.set(0.6, 0, 0);
    satelliteBody.add(panel);

    // Otro panel en el lado opuesto
    var panel2 = panel.clone();
    panel2.position.set(-0.6, 0, 0);
    satelliteBody.add(panel2);
}

// Función para mostrar los iconos de clima en la Tierra 
function createWeatherIcon(coordenadas, clima, nombreCiudad, temperatura) {
    const textureLoader = new THREE.TextureLoader();
    var weatherTexture;

    // Se asigna una textura según el tipo de clima
    switch (clima) {
        case 'Soleado':
            weatherTexture = textureLoader.load('https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/sol.png?v=1731284929820');
            break;
        case 'Lluvia':
            weatherTexture = textureLoader.load('https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/lluvia.png?v=1731284944831');
            break;
        case 'Nublado':
            weatherTexture = textureLoader.load('https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/nubes.png?v=1731284935925');
            break;
        case 'Ventoso':
            weatherTexture = textureLoader.load('https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/viento.png?v=1731284954260');
            break;
        case 'Polar':
            weatherTexture = textureLoader.load('https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/nieve.png?v=1731807244817');
            break
        default:
            weatherTexture = textureLoader.load('https://cdn.glitch.global/24bc0c45-4491-444b-83a6-25a9b15f8faa/viento.png?v=1731284954260');
    }

    const spriteMaterial = new THREE.SpriteMaterial({ map: weatherTexture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Se configura el tamaño del icono
    sprite.scale.set(0.3, 0.3, 1);
    sprite.position.set(coordenadas.x, coordenadas.y, coordenadas.z);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Se configura el tamaño del canvas
    canvas.width = 200;  
    canvas.height = 80;  

    // Se configura el tamaño de texto para la ciudad y temperatura
    const fontSizeCity = 30;
    const fontSizeTemp = 25; 
    context.font = `bold ${fontSizeCity}px Arial`;
    context.fillStyle = 'white';
    context.textAlign = 'center';

    const cityWidth = context.measureText(nombreCiudad).width;
    context.font = `bold ${fontSizeTemp}px Arial`;
    const tempWidth = context.measureText(`${temperatura}°C`).width;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Se configura el contorno del texto para que vea más legible
    const shadowOffset = 2; 
    context.fillStyle = 'red'; 
    context.font = `bold ${fontSizeCity}px Arial`; 
    context.fillText(nombreCiudad, canvas.width/2 + shadowOffset, canvas.height/2 - 5 + shadowOffset); 
    context.font = `bold ${fontSizeTemp}px Arial`; 
    const temperaturaTexto = `${temperatura}°C`;
    context.fillText(temperaturaTexto, canvas.width/2 + shadowOffset, canvas.height/2 + fontSizeTemp + shadowOffset);

    // Se añade el texto
    context.fillStyle = 'orange';
    context.font = `bold ${fontSizeCity}px Arial`;
    context.fillText(nombreCiudad, canvas.width/2, canvas.height/2 - 5);
    context.font = `bold ${fontSizeTemp}px Arial`;
    context.fillText(temperaturaTexto, canvas.width/2, canvas.height/2 + fontSizeTemp);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture, transparent: true });
    const textSprite = new THREE.Sprite(textMaterial);

    // Se configura la escala y posición del texto
    textSprite.scale.set(1.2, 0.4, 1);
    textSprite.position.set(coordenadas.x, coordenadas.y + 0.3, coordenadas.z);

    // Se crea la línea de ciudades con el tipo de clima
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const linePoints = [ new THREE.Vector3(0, 0, 0), new THREE.Vector3(coordenadas.x, coordenadas.y, coordenadas.z) ];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const line = new THREE.Line(lineGeometry, lineMaterial);  
  
    const tierra = scene.getObjectByName('Tierra');
    if (tierra) {
        tierra.add(sprite);
        tierra.add(textSprite);
        tierra.add(line);
    } else {
        scene.add(sprite);
        scene.add(textSprite);
        scene.add(line);
    }
}

// Función para mapear el tipo de clima a un ícono
function mappingClimate(tipoDeClima) {
    switch (tipoDeClima) {
        case 'Tropical':
            return 'Soleado';  
        case 'Mediterráneo':
            return 'Soleado';  
        case 'Templado':
            return 'Nublado';  
        case 'Subtropical':
            return 'Lluvia';   
        case 'Continental':
            return 'Ventoso';  
        default:
            return 'Polar';
    }
}

// Funciones para configurar doble textura para la Tierra de día y noche
// Fragment Shader
function fragmentShader() {
  return `
    uniform sampler2D textureDay; 
    uniform sampler2D textureNight;
    
    varying vec2 vUv;
    varying vec3 v_vert2Sun;
    varying vec3 v_Normal;

    void main() {
        float light = dot(v_vert2Sun, v_Normal);
        if (light > 0.0) gl_FragColor = vec4(texture2D(textureDay, vUv).rgb, 1.0);
        else gl_FragColor = vec4(texture2D(textureNight, vUv).rgb, 1.0);
    }`;
}

// Vertex Shader
function vertexShader() {
  return `
    varying vec2 vUv;
    varying vec3 v_Normal;
    varying vec3 v_vert2Sun;

    void main() {
        vUv = uv;
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        vec4 viewSunPos = viewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        v_Normal = normalize(normalMatrix * normal);
        v_vert2Sun = normalize(viewSunPos.xyz - modelViewPosition.xyz);
        gl_Position = projectionMatrix * modelViewPosition;
    }`;
}

// Función para una creación de planetas
function createPlanet(name, radius, distance, speed, textureDayURL, textureNightURL = null) {
    geometry = new THREE.SphereGeometry(radius, 32, 32);
  
    // Se utiliza el shader con dos texturas si es para la Tierra
    if (name === 'Tierra' && textureNightURL) {
        const textureDay = new THREE.TextureLoader().load(textureDayURL);
        const textureNight = new THREE.TextureLoader().load(textureNightURL);
        material = new THREE.ShaderMaterial({
            uniforms: {
                textureDay: { type: "t", value: textureDay },
                textureNight: { type: "t", value: textureNight }
            },
            vertexShader: vertexShader(), fragmentShader: fragmentShader(),
            roughness: 0.8, metalness: 0.1
        });
    } else {
        // Se mantiene la textura para varios planetas
        const texture = new THREE.TextureLoader().load(textureDayURL);
        material = new THREE.MeshStandardMaterial({
            map: texture, roughness: 0.8, metalness: 0.1
        });
    }
  
    var planet = new THREE.Mesh(geometry, material);
    
    // Se configura la distancia, velocidad y posición inicial
    planet.userData = { distance: distance, speed: speed, rotationSpeed: 0.01 };
    planet.position.set(distance, 0, 0);
    planet.name = name;

    // Se desactivan las sombras
    planet.castShadow = false;
    planet.receiveShadow = false;

    planets.push(planet);
    scene.add(planet);

    // Se crea órbita
    createOrbit(distance, false);

    // Se añade la capa de nubes para la Tierra
    if (name === 'Tierra') { createCloudLayer(planet); }

    // Se añade los anillos para Saturno
    if (name === 'Saturno') {
        createRings(planet, 3, 4, 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/saturno-ring.png?v=1729515966734');
    }
}



// -------------------------------------------------

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClickPlanet(event) {
    // Se convierte la posición del mouse a coordenadas de pantalla normalizadas
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Se calcula los objetos intersectados
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);
  
    // Se muestra la información si se hace clic en un planeta
    if (intersects.length > 0) {
        const planet = intersects[0].object;
    }
}

// Función para creación de un fondo en la escena
function createBackground(imageURL) {
    const loader = new THREE.TextureLoader();
    loader.load(imageURL, function(texture) {
        scene.background = texture;
    });
}

// Función para una creación de Sol
function createStar(textureURL) {
    geometry = new THREE.SphereGeometry(4, 32, 32);
    texture = new THREE.TextureLoader().load(textureURL);
    material = new THREE.MeshStandardMaterial({ 
        map: texture,
        emissive: new THREE.Color(0xFFFF99), emissiveMap: texture, emissiveIntensity: 1.2,              
        roughness: 0.5, metalness: 0.5
    });
    var star = new THREE.Mesh(geometry, material);

    star.position.set(0, 0, 0);
    star.userData = { rotationSpeed: 0.01 };
    star.castShadow = false;
    star.receiveShadow = false;
  
    // Aumentar la intensidad de la luz del sol
    const sunLight = new THREE.PointLight(0xFFFFFF, 2, 100);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
  
    scene.add(sunLight);
    scene.add(star);
}

// Función para una creación de una capa de nubes para la Tierra
function createCloudLayer(planet) {
    const cloudTextureURL = 'https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/Earth_clouds.jpg?v=1729449311505';
    const geometry = new THREE.SphereGeometry(planet.geometry.parameters.radius + 0.01, 32, 32);
    const texture = new THREE.TextureLoader().load(cloudTextureURL);
    const material = new THREE.MeshStandardMaterial({
        map: texture, transparent: true, opacity: 0.4, depthWrite: false,
    });

    const clouds = new THREE.Mesh(geometry, material);
    clouds.name = "Clouds";
    planet.add(clouds);
}

// Función para una creación de luna
function createMoon(planet, radius, distance, speed, textureURL) {
    geometry = new THREE.SphereGeometry(radius, 32, 32);
    texture = new THREE.TextureLoader().load(textureURL);
    material = new THREE.MeshStandardMaterial({ map: texture });
    var moon = new THREE.Mesh(geometry, material);

    // Se configura la distancia y velocidad de rotación
    moon.userData = { distance: distance, speed: speed, rotationSpeed: 0.005 };
    moon.position.set(distance, 0, 0);

    moons.push({ moon, planet });
    planet.add(moon);

    // Crear la órbita de la luna
    createOrbit(distance, moon);
}

// Función para una creación de un círculo que represente la órbita
function createOrbit(distance, moon) {
    const points = [];
    const numPoints = 100; // Número de segmentos en la órbita

    for (var i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        points.push(new THREE.Vector3(x, 0, z));
    }

    geometry = new THREE.BufferGeometry().setFromPoints(points);
    material = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5 });
    const line = new THREE.LineLoop(geometry, material);
  
    // Se comprueba si la órbita de la luna está centrada en el planeta
    if (moon) {
        line.position.copy(moon.position);
        line.position.set(0, 0, 0);
        moon.parent.add(line);
    } else {
        // Se añade la línea a la escena para los planetas
        scene.add(line);
    }
    
    orbits.push(line);
}

// Función para una creación de un cinturón de asteroides y uno de Kruiper
function createAsteroidBelt(innerRadius, outerRadius, numAsteroids, textureURL) {
    const asteroidTexture = new THREE.TextureLoader().load(textureURL);
    const asteroidMaterial = new THREE.MeshStandardMaterial({
        map: asteroidTexture,
        roughness: 0.8,
        metalness: 0,
    });

    const asteroids = [];

    for (let i = 0; i < numAsteroids; i++) {
        const asteroidGeometry = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 8, 8);
        const positions = asteroidGeometry.attributes.position.array;

        for (let j = 0; j < positions.length; j += 3) {
            const offset = (Math.random() - 0.5) * 0.2;
            positions[j] += offset;     
            positions[j + 1] += offset; 
            positions[j + 2] += offset;
        }

        asteroidGeometry.attributes.position.needsUpdate = true; 
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        // Se posiciona el asteroide aleatoriamente en el rango del cinturón de asteroides
        const distance = Math.random() * (outerRadius - innerRadius) + innerRadius;
        const angle = Math.random() * Math.PI * 2;

        // Se almacena la distancia y el ángulo del asteroide en userData
        asteroid.userData = { distance, angle };

        asteroid.position.set(
            Math.cos(angle) * distance,
            Math.random() * 2 - 1,
            Math.sin(angle) * distance
        );

        asteroid.scale.set(
            Math.random() * 0.5 + 0.5, 
            Math.random() * 0.5 + 0.5, 
            Math.random() * 0.5 + 0.5 
        );

        asteroid.rotation.x = Math.random() * Math.PI;
        asteroid.rotation.y = Math.random() * Math.PI;
        asteroid.rotation.z = Math.random() * Math.PI;

        scene.add(asteroid);
        asteroids.push(asteroid);
    }

    return asteroids;
}

// Función para una creación de un anillo para Saturno
function createRings(planet, innerRadius, outerRadius, textureURL) {
    geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    texture = new THREE.TextureLoader().load(textureURL);
    material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
    });

    const ring = new THREE.Mesh(geometry, material);

    // Se configura la orientación del anillo para que esté alineado con el planeta
    ring.rotation.x = Math.PI / 2;

    planet.add(ring);
}

// Función para hacer zoom en un planeta
function zoomToPlanet(planet) {
    if (currentPlanet) { currentPlanet.scale.set(1, 1, 1); }

    isZooming = true;
    currentPlanet = planet;

    // Calcula la posición objetivo de la cámara en función de la posición del planeta
    const direction = new THREE.Vector3().subVectors(camera.position, planet.position).normalize();
    const targetPosition = new THREE.Vector3().addVectors(planet.position, direction.multiplyScalar(cameraOffsetDistance));

    // Configura y ejecuta la animación de zoom
    const duration = 1000; // Duración de la animación en ms
    const startPosition = camera.position.clone();
    const startTime = performance.now();

    requestAnimationFrame((time) => animateZoom(time, startPosition, targetPosition, startTime, duration));
}

// Función que anima el zoom de la cámara hacia el planeta
function animateZoom(time, startPosition, targetPosition, startTime, duration) {
    const elapsedTime = time - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    // Interpola la posición de la cámara para lograr un zoom suave
    camera.position.lerpVectors(startPosition, targetPosition, progress);
    controls.target.copy(currentPlanet.position);

    // Continúa la animación mientras no se haya alcanzado el final
    if (progress < 1) {
        requestAnimationFrame((newTime) => animateZoom(newTime, startPosition, targetPosition, startTime, duration));
    } else {
        isZooming = false;
    }

    controls.update();
}

// Función para alternar entre las vistas del ovni y el Sistema Solar
function changeView() {
    isPerspectiveView = !isPerspectiveView;

    if (isPerspectiveView) {
        // Vista cercana (desde el OVNI)
        const spaceship = scene.children.find(child => child.isSpaceship);
        if (spaceship) {
            camera.position.set(spaceship.position.x - 10, spaceship.position.y + 5, spaceship.position.z);
            controls.target.copy(spaceship.position);
        }
        controls.enabled = false;
    } else {
        // Vista lejana (sistema solar)
        const scaleFactor = 0.5; 
        planets.forEach(planet => planet.scale.set(scaleFactor, scaleFactor, scaleFactor));
        moons.forEach(moonData => moonData.moon.scale.set(scaleFactor, scaleFactor, scaleFactor));
        asteroidBelt1.forEach(asteroid => asteroid.scale.set(scaleFactor, scaleFactor, scaleFactor));
        asteroidBelt2.forEach(asteroid => asteroid.scale.set(scaleFactor, scaleFactor, scaleFactor));

        camera.position.set(0, 10, 10);
        controls.target.set(0, 0, 0);        
        controls.enabled = true;
    }
    controls.update();
}

// Función para una creación de una nave (ovni)
function createSpaceship() {
    const tamañoSpaceship = 0.3;
    const loader = new THREE.TextureLoader();
    const texturaPlatillo = loader.load('https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/ovni.png?v=1730171906268');
    const texturaTapa = loader.load('https://cdn.glitch.global/0a4731e2-e4fb-4c54-8c93-ca370b4130e5/alien-ovni.png?v=1730169753288');

    // Se configura el recorte de la textura de la tapa
    texturaTapa.repeat.set(1, 1); 
    texturaTapa.offset.set(0, 0);

    // Geometría y material del cuerpo con forma de platillo
    const radioExterior = tamañoSpaceship * 1.5;
    const heightPlatillo = 0.2; // Altura del cuerpo
    const geometryPlatillo = new THREE.CylinderGeometry(radioExterior, radioExterior, heightPlatillo, 32);
    const materialPlatillo = new THREE.MeshBasicMaterial({ map: texturaPlatillo });
    const spaceshipPlatillo = new THREE.Mesh(geometryPlatillo, materialPlatillo);

    spaceshipPlatillo.rotation.y = Math.PI / 2;

    // Geometría y material de la tapa con textura
    const geometryTapa = new THREE.SphereGeometry(tamañoSpaceship, 32, 32);
    const materialTapa = new THREE.MeshBasicMaterial({ map: texturaTapa });
    const spaceshipTapa = new THREE.Mesh(geometryTapa, materialTapa);

    spaceshipTapa.rotation.z = Math.PI / 8;
    spaceshipTapa.position.y = heightPlatillo / 2; 

    const spaceship = new THREE.Group();
    spaceship.add(spaceshipPlatillo);
    spaceship.add(spaceshipTapa);
    spaceship.position.set(0, 2, 15);
    spaceship.isSpaceship = true;

    scene.add(spaceship);
}

// Función para comprobar si detecta colisiones si el ovni se dirige a un planeta
function checkCollision(spaceship, planets, nextPosition) {
    for (const planet of planets) {
        // Calcula la distancia entre la posición del OVNI y el planeta
        const distance = nextPosition.distanceTo(planet.position);

        // Si la distancia es menor, hay colisión
        if (distance < spaceshipCollisionRadius + planetCollisionRadius + collisionMargin) {
            return true; // Hay una colisión si está dentro del margen
        }
    }
    return false; // No hay colisión si no está dentro del margen
}

// Función para mostrar información
function showInformation(title, description) {
    const infoBox = document.getElementById("infoBox");
    const infoTitle = document.getElementById("infoTitle");
    const infoDescription = document.getElementById("infoDescription");

    infoTitle.textContent = title;
    infoDescription.textContent = description;
    infoBox.style.display = "block";
}

// Función para ocultar información
function hideInformation() {
    const infoBox = document.getElementById("infoBox");
    infoBox.style.display = "none";
}

// Función para alternar la visibilidad de un cuadro de texto (manual de instrucciones)
function changeControlText() {
    const controlTextDiv = document.getElementById('control-text');
    if (isControlTextVisible) { controlTextDiv.style.display = 'none'; } 
    else { controlTextDiv.style.display = 'block'; }
    isControlTextVisible = !isControlTextVisible;
}

// Función para alternar la visibilidad de las órbitas de los planetas
function changeOrbits() {
  showOrbits = !showOrbits;
  orbits.forEach(orbit => {
    orbit.visible = showOrbits;
  })
}

function animationLoop() {
    requestAnimationFrame(animationLoop);
  
    controls.update();
  
    const spaceship = scene.children.find(child => child.isSpaceship);
    if (isPerspectiveView) {
        const nextPosition = spaceship.position.clone();

        // Mover el OVNI en la dirección en la que está mirando
        if (moveForward) {
            // Se calcula el movimiento para avanzar hacia delante en relación a la dirección de la cámara
            nextPosition.x -= Math.sin(cameraAngle) * spaceshipSpeed;
            nextPosition.z -= Math.cos(cameraAngle) * spaceshipSpeed;
        }
      
        if (moveBackward) {
            // Se calcula el movimiento para retroceder por detrás en relación a la dirección de la cámara
            nextPosition.x += Math.sin(cameraAngle) * spaceshipSpeed;
            nextPosition.z += Math.cos(cameraAngle) * spaceshipSpeed;
        }
      
        if (moveLeft) {
            // Se calcula el movimiento hacia la izquierda en relación a la dirección de la cámara
            nextPosition.x -= Math.cos(cameraAngle) * spaceshipSpeed;
            nextPosition.z += Math.sin(cameraAngle) * spaceshipSpeed; 
        }
      
        if (moveRight) {
            // Se calcula el movimiento hacia la derecha en relación a la dirección de la cámara
            nextPosition.x += Math.cos(cameraAngle) * spaceshipSpeed;
            nextPosition.z -= Math.sin(cameraAngle) * spaceshipSpeed;
        }

        // Mover el OVNI para elevarse y descenderse
        if (moveUp) { nextPosition.y += spaceshipSpeed; }
        if (moveDown) { nextPosition.y -= spaceshipSpeed; }

        // Se comprueba si detecta colisiones si está cerca del planeta
        if (!checkCollision(spaceship, planets, nextPosition)) {
            spaceship.position.copy(nextPosition);
        }

        // Se rota la cámara alrededor del OVNI
        if (rotateSceneLeft) { cameraAngle += rotationSpeed; }
        if (rotateSceneRight) { cameraAngle -= rotationSpeed; }

        // Se actualiza la posición de la cámara para seguir al ovni
        camera.position.set(
            spaceship.position.x + Math.sin(cameraAngle) * 5,
            spaceship.position.y + 2, // Altura
            spaceship.position.z + Math.cos(cameraAngle) * 5
        );

        // La cámara mira hacia el ovni
        controls.target.copy(spaceship.position);
    }

    timestamp += speedFactor;

    // Orbitar los planetas alrededor del Sol
    planets.forEach(planet => {
        planet.position.x = Math.cos(timestamp * planet.userData.speed) * planet.userData.distance;
        planet.position.z = Math.sin(timestamp * planet.userData.speed) * planet.userData.distance;

        // Se rota el planeta sobre su eje
        planet.rotation.y += planet.userData.rotationSpeed;

        // Rotar las nubes
        if (planet.children.length > 0) {
            planet.children[0].rotation.y += 0.005;
        }
    });

    // Rotar el Sol
    const sun = scene.children.find(child => child.userData && child.userData.rotationSpeed);
    if (sun) { sun.rotation.y += sun.userData.rotationSpeed; }

    // Orbitar las lunas alrededor de sus planetas
    moons.forEach(({ moon, planet }) => {
        moon.position.x = Math.cos(timestamp * moon.userData.speed) * moon.userData.distance;
        moon.position.z = Math.sin(timestamp * moon.userData.speed) * moon.userData.distance;

        // Se rota la luna sobre su eje
        moon.rotation.y += moon.userData.rotationSpeed;
    });

    // Mostrar el cinturón de asteroides
    [asteroidBelt1, asteroidBelt2].forEach(asteroidBelt => {
        asteroidBelt.forEach(asteroid => {
            asteroid.userData.angle += speedFactor * 0.3;
            const distance = asteroid.userData.distance;
            asteroid.position.x = Math.cos(asteroid.userData.angle) * distance;
            asteroid.position.z = Math.sin(asteroid.userData.angle) * distance;
        });
    });

    // Se cambia la posición de la cámara si se selecciona un planeta en la vista del sistema solar
    if (currentPlanet && !isPerspectiveView) {
        const direction = new THREE.Vector3().subVectors(camera.position, currentPlanet.position).normalize();
        const targetPosition = new THREE.Vector3().addVectors(currentPlanet.position, direction.multiplyScalar(cameraOffsetDistance));
        camera.position.lerp(targetPosition, 0.1);
        controls.target.copy(currentPlanet.position);
    }

    renderer.render(scene, camera);
}

// Se añade eventos de mouse
window.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Clic izquierdo
        isDragging = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
});

window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        cameraOffset.x += deltaX * 0.1;
        cameraOffset.y -= deltaY * 0.1; 

        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});


window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Intersectar todos los planetas
    const intersects = raycaster.intersectObjects(planets, true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        if (intersectedObject.name === "Tierra" || intersectedObject.parent.name === "Tierra") {
            const planetName = "Tierra";
            const info = planetInformation[planetName];

            if (info) { showInformation(info.title, info.description); }
        }

        else if (intersectedObject.name === "Marte" || intersectedObject.parent.name === "Marte") {
            const planetName = "Marte"; // Forzar a mostrar info de Marte
            const info = planetInformation[planetName];

            if (info) { showInformation(info.title, info.description); }
        }
      
        // Si no es Tierra ni Marte, se muestra la información de cada planeta
        else if (intersectedObject.name !== "Clouds") {
            const planetName = intersectedObject.name;
            const info = planetInformation[planetName];

            if (info) { showInformation(info.title, info.description); }
        }
    }
});


// Se evita que se cierre el cuadro de información al hacer clic dentro de él
document.addEventListener('click', function(event) {
    const infoBox = document.getElementById("infoBox");
    const isClickInside = infoBox.contains(event.target);

    // Si el clic está fuera del cuadro, se oculta el cuadro de información
    if (!isClickInside && infoBox.style.display === "block") {
        hideInformation();
    }
});


// Maneja las teclas para mostrar u ocultar y para los controles del ovni
document.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') { changeControlText(); } 
    else if (event.key === 'o' || event.key === 'O') { changeOrbits(); }
    else if (event.key === 'ArrowUp') { moveForward = true; } 
    else if (event.key === 'ArrowDown') { moveBackward = true; } 
    else if (event.key === 'ArrowLeft') { moveLeft = true; } 
    else if (event.key === 'ArrowRight') { moveRight = true; } 
    else if (event.key === 'a' || event.key === 'A') { rotateSceneLeft = true; } 
    else if (event.key === 'd' || event.key === 'D') { rotateSceneRight = true; } 
    else if (event.key === 'w' || event.key === 'W') { moveUp = true; } 
    else if (event.key === 's' || event.key === 'S') { moveDown = true; }
});

// Maneja la liberación de las teclas para detener el movimiento
document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') { moveForward = false; } 
    else if (event.key === 'ArrowDown') { moveBackward = false; } 
    else if (event.key === 'ArrowLeft') { moveLeft = false; } 
    else if (event.key === 'ArrowRight') { moveRight = false; } 
    else if (event.key === 'a' || event.key === 'A') { rotateSceneLeft = false; } 
    else if (event.key === 'd' || event.key === 'D') { rotateSceneRight = false; } 
    else if (event.key === 'w' || event.key === 'W') { moveUp = false; } 
    else if (event.key === 's' || event.key === 'S') { moveDown = false; }
});

// Se añade eventos para los botones
// Alternar vista
document.getElementById('change-view-button').addEventListener('click', changeView);

// Planetas
document.getElementById('mercury-button').addEventListener('click', () => zoomToPlanet(planets[0])); // Mercurio
document.getElementById('venus-button').addEventListener('click', () => zoomToPlanet(planets[1]));   // Venus
document.getElementById('earth-button').addEventListener('click', () => zoomToPlanet(planets[2]));   // Tierra
document.getElementById('mars-button').addEventListener('click', () => zoomToPlanet(planets[3]));    // Marte
document.getElementById('jupiter-button').addEventListener('click', () => zoomToPlanet(planets[4])); // Júpiter
document.getElementById('saturn-button').addEventListener('click', () => zoomToPlanet(planets[5]));  // Saturno
document.getElementById('uranus-button').addEventListener('click', () => zoomToPlanet(planets[6]));  // Urano
document.getElementById('neptune-button').addEventListener('click', () => zoomToPlanet(planets[7])); // Neptuno
document.getElementById('pluto-button').addEventListener('click', () => zoomToPlanet(planets[8]));   // Plutón

// Cerrar el cuadro de información
document.getElementById("hideButton").addEventListener("click", hideInformation); // Ocultar información

// Se añade eventos para mostrar/ocultar botones
const changeButton = document.getElementById('change-button');
const planetList = document.getElementById('planet-list');

// Selecciona los elementos del cuadro de información
const infoBox = document.getElementById('info-box');
const infoTitle = document.getElementById('info-title');
const infoDescription = document.getElementById('info-description');

// Se comprueba si los elementos existen antes de agregar el evento
if (changeButton && planetList) {
    planetList.style.display = 'none';
    changeButton.addEventListener('click', () => {
        if (planetList.style.display === 'none') { planetList.style.display = 'block'; } 
        else { planetList.style.display = 'none'; }
    });
}

// Información detallada de cada planeta donde se va a mostrar el cuadro de información
const planetInformation = {
    "Mercurio": {
        title: "Mercurio",
        description: "Es el planeta más cercano al Sol, que orbitan alrededor de nuestra estrella " + 
                     "a una distancia media de 57,9 millones de km, teniendo sólo 88 días para " +
                     "completar un viaje alrededor del sol."
    },
    "Venus": {
        title: "Venus",
        description: "Es un planeta rocoso, sin satélites y sin anillos. Se trata de un planeta extremo, " + 
                     "caliente, seco y con una presión en la superficie 90 veces superior a la terrestre. " +
                     "Es el planeta más caliente de todos, su atmósfera y composición hacen que la vida sea " +
                     "muy poco probable."
    },
    "Tierra": {
        title: "Tierra",
        description: "Se formó hace más de 4,500 millones de años. Es el quinto planeta más grande del Sistema " +
                     "Solar y el tercero más cercano al Sol; su distancia promedio a éste es de unos 149'597,890 km " +
                     "o prácticamente 150 millones de kilómetros. Presenta una forma esférica y ligeramente achatada " +
                     "en los polos. Su diámetro es apenas un poco más grande que el de Venus. Es un planeta sin anillos " +
                     "pero con un satélite natural, la Luna."
    },
    "Marte": {
        title: "Marte",
        description: "Es el segundo planeta más pequeño del Sistema Solar, sólo superado por Mercurio. Debido a la " +
                     "inclinación de su eje de rotación, experimenta estaciones como la Tierra que varían en duración " +
                     "debido a su órbita elíptica. No tiene anillos pero sí 2 satélites: Fobos y Deimos, descubiertos en 1877."
    },
    "Júpiter": {
        title: "Júpiter",
        description: "El primer planeta gaseoso se encuentra después del cinturón de asteroides y es Júpiter. " +
                     "Es el planeta más grande del Sistema Solar y el quinto en distancia al Sol. " +
                     "Se formó a partir del material que quedó después de la formación del 'astro rey'. " +
                     "Tiene unos 50 satélites conocidos pero otros 17 cuerpos celestes están en espera de ser confirmado como satélites."
    },
    "Saturno": {
        title: "Saturno",
        description: "Uno de los planetas más distintivos del Sistema Solar. Es una gran bola de gas con una masa " +
                     "casi 95.1 veces la de la Tierra y un volumen 755 veces mayor, famosa por sus numerosos anillos."
    },
    "Urano": {
        title: "Urano",
        description: "Es el tercer planeta más grande del Sistema Solar y el séptimo planeta más cercano al Sol, " +
                     "con una distancia de 2,879'872,200 km o en términos prácticos, 2.9 miles de millones de " +
                     "kilómetros. Es un planeta gaseoso con una gran cantidad de metano en su superficie, lo que " +
                     "le confiere un tono azulado."
    },
    "Neptuno": {
        title: "Neptuno",
        description: "El planeta más alejado del Sol, se encuentra a una distancia de 4.5 mil millones de kilómetros. " +
                     "Es un planeta poco brillante pues como se puede suponer, su brillo no es destacable por encontrarse " +
                     "tan alejado del Sol."
    },
    "Plutón": {
        title: "Plutón",
        description: "Plutón, anteriormente considerado el noveno planeta del Sistema Solar, fue reclasificado como un planeta " +
                     "enano en 2006. Se encuentra a una distancia media de 5.9 mil millones de kilómetros del Sol y tiene una " +
                     "superficie helada y montañas de hielo de nitrógeno. Su órbita es altamente elíptica y toma aproximadamente 248 " +
                     "años terrestres en completar una vuelta alrededor del Sol."
    }
};

