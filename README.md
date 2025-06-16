# 🌌 Sistema Planetario
**Proyecto de Informática Gráfica**

## 📑 Tabla de Contenidos
- Introducción
- Tecnologías utilizadas
- Componentes del Sistema Solar
- Interacciones con el usuario
- Funcionalidades
- Demostración visual
- Instalación y ejecución

---

## 📘 Introducción

En este proyecto, consiste en una visualización en 3D del Sistema Solar utilizando la biblioteca [Three.js](https://threejs.org/). Por tanto, los usuarios pueden explorar los diferentes planetas,
sus lunas, anillos y cinturones de asteroides. Asimismo, se pueden observar los planetas girando sobre sí mismos y orbitando alrededor del Sol. Para ello, pueden acercar la cámara a un planeta
seleccionado mediante el botón `Mostrar Planetas`. Una vez acercado, al hacer clic en el planeta en la escena, se muestra información detallada sobre este planeta. También, se puede mover una nave
espacial, o más bien, un ovni, a través de la escena utilizando las teclas del teclado. De este modo, se pueden activar y desactivar las órbitas de los planetas, y contiene un cuadro de texto que
proporciona un manual de instrucciones sobre cómo utilizar la simulación de este proyecto.

Como parte de una mejora, el proyecto utiliza los datos climáticos a través de un archivo CSV. Para ello, estos datos utilizan para colocar los íconos climáticos e información como
el nombre de las ciudades y la temperatura de cada ciudad, lo que permite visualizar el tipo de clima como soleado, lluvioso, nublado, etc. En cuanto a la Tierra, este contiene doble textura, una para el
día y otra para la noche para tener un aspecto según la iluminación, y se mantiene una capa de nube.

Finalmente, contiene un satélite que orbita alrededor del planeta, que cuenta con su antena y sus paneles solares.

---

## 🛠️ Tecnologías utilizadas

- [JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript):  Lenguaje principal del proyecto.  
- [Three.js](https://threejs.org/):  Biblioteca para gráficos 3D en la web.  
- [Node.js](https://nodejs.org/):  Entorno de ejecución para el servidor y herramientas.  
- [npm](https://www.npmjs.com/):  Gestor de paquetes para instalar dependencias.  
- [CSV](https://es.wikipedia.org/wiki/Valores_separados_por_comas):  Formato para datos climáticos.  
- [Visual Studio Code](https://code.visualstudio.com/):  Editor de código recomendado.  

---

## 🪐 Componentes del Sistema Solar

### 🌍 Planetas
- Mercurio, Venus, Tierra y su Luna, Marte con sus Lunas Fobos y Deimos, Júpiter, Saturno, Urano, Neptuno, Plutón.

### ☀️ Cuerpos celestes
- Sol (estrella central).  
- Cinturón de Asteroides (entre Marte y Júpiter).  
- Cinturón de Kuiper (más allá de Neptuno).

### 💡 Iluminación
- La luz ambiental proporciona una iluminación uniforme en toda la escena, creando sombras suaves, lo que permite que esta luz ayuda a que todos los
  planetas se vean bien desde cualquier ángulo.
- La luz de punto simula la luz más directa sobre los planetas y lunas por el Sol.
    
### 🧱 Otros componentes
- Nubes atmosféricas en la Tierra.  
- Rotación de cada planeta sobre su eje.

---

## 🕹️ Interacciones con el usuario

### 📘 Manual de Instrucciones
- Presiona `H` para mostrar u ocultar el cuadro de instrucciones.

### 🛸 Control del Ovni
- ↑ Avanzar  
- ↓ Retroceder  
- ← Mover izquierda  
- → Mover derecha  
- `W` / `S`: Subir / Bajar  
- `A` / `D`: Girar ovni

### 🪐 Visualización de planetas y órbitas
- Botón `Mostrar Planetas`: Acercarse al planeta  
- Clic en planeta: Mostrar detalles  
- `O`: Activar/Desactivar órbitas

### 🎥 Control de cámara
- Rueda del ratón: Zoom  
- Arrastrar con botón izquierdo: Rotar vista

---

## 🧩 Funcionalidades

### 🧠 Sistema Planetario I
- `init()`, `onWindowResize()`, `onClickPlanet()`, `createBackground()`
- `createStar()`, `createCloudLayer()`, `createMoon()`, `createOrbit()`
- `createAsteroidBelt()`, `createRings()`, `zoomToPlanet()`, `animateZoom()`
- `changeView()`, `createSpaceship()`, `checkCollision()`
- `changeControlText()`, `changeOrbits()`, `animationLoop()`

### 🌦️ Sistema Planetario II (clima y satélite)
- `latLonToXYZ()`, `createSatelliteWithAntenna()`, `createSatelliteAntenna()`
- `createSolarPanels()`, `createWeatherIcon()`, `mappingClimate()`
- `fragmentShader()`, `vertexShader()`, `createPlanet()`

---

## 🖼 Demostraciones visuales
- **Desde la vista de planetas**
  
  ![Vista Planetas](https://github.com/JericoLuzardoMiranda/IG-Sistema-Planetario/blob/7ac954474ed441aba85e0b91e6ddef4319036f56/media/captura1.png)

- **Desde la vista de un ovni**

  ![Vista Ovni](https://github.com/JericoLuzardoMiranda/IG-Sistema-Planetario/blob/7ac954474ed441aba85e0b91e6ddef4319036f56/media/captura2.png)

---

## ⚙️ Instalación y ejecución
> ⚠️ Requisitos previos:  
> - Tener [Node.js](https://nodejs.org/) instalado.  
> - Tener [Git](https://git-scm.com/) instalado para clonar el repositorio.

### 📥 Clonar el repositorio
```bash
git clone https://github.com/JericoLuzardoMiranda/IG-Sistema-Planetario.git
cd IG-Sistema-Planetario/app
npm install
npm start
```

Después de ejecutar `npm start`, abre tu navegador y visita la URL que aparece en la consola, normalmente algo como `http://localhost:puerto` (el puerto puede variar).

Para detener la aplicación, presiona `Ctrl + C` en la terminal.
