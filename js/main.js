import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    Vector3,
    AxesHelper,
    SphereBufferGeometry,
    HemisphereLight,
    AmbientLight,
    BoxBufferGeometry,
    PlaneBufferGeometry,
    MeshStandardMaterial,
    CubeTextureLoader,
    sRGBEncoding,
    CameraHelper,
} from './lib/three.module.js';

import WaterMaterial from './materials/WaterMaterial.js';
import ModelLoader from './lib/ModelLoader.js'
import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';
import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';
import Skybox from './shaders/Skybox.js';
import TimeCycleController from './controls/TimeCycleController.js';
import Slepinir from './assets/sleipnir.js';
import {generateBillboardClouds, animateClouds} from './terrain/Weather.js';

async function main() {

    const scene = new Scene();

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);

    /**
     * Add light
     */
    const sun = new DirectionalLight(0xffffff, 2);
    sun.position.set(1000, 1000, 0);
    sun.castShadow = true;

    //Set up shadow properties for the light

    const sunShadMapSize = 512;
    const shadownWidth = 60;
    sun.shadow.mapSize.width = sunShadMapSize;
    sun.shadow.mapSize.height = sunShadMapSize;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 1200;
    sun.shadow.camera.left = -shadownWidth;
    sun.shadow.camera.right = shadownWidth;
    sun.shadow.camera.top = shadownWidth;
    sun.shadow.camera.bottom = -shadownWidth;

    scene.add(sun);

    // Set direction
    sun.target.position.set(0, 15, 0);
    scene.add(sun.target);

    camera.position.z = 30;
    camera.position.y = 100;
    camera.rotation.x -= Math.PI * 0.3;



    /**
     * Add terrain:
     * 
     * We have to wait for the image file to be loaded by the browser.
     * There are many ways to handle asynchronous flow in your application.
     * We are using the async/await language constructs of Javascript:
     *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
     */
    const heightmapImage = await Utilities.loadImage('resources/images/custom_heightmap2.png');
    const width = 100;

    const simplex = new SimplexNoise();
    const terrainGeometry = new TerrainBufferGeometry({
        width,
        heightmapImage,
        noiseFn: simplex.noise.bind(simplex),
        numberOfSubdivisions: 64,
        height: 20
    });

    const grassTexture = new TextureLoader().load('resources/textures/grass_02.png');
    grassTexture.wrapS = RepeatWrapping;
    grassTexture.wrapT = RepeatWrapping;
    grassTexture.repeat.set(5000 / width, 5000 / width);

    const rockTexture = new TextureLoader().load('resources/textures/rock_02.png');
    rockTexture.wrapS = RepeatWrapping;
    rockTexture.wrapT = RepeatWrapping;
    rockTexture.repeat.set(1500 / width, 1500 / width);

    const snowyRockTexture = new TextureLoader().load('resources/textures/snowy_rock_01.png');
    snowyRockTexture.wrapS = RepeatWrapping;
    snowyRockTexture.wrapT = RepeatWrapping;
    snowyRockTexture.repeat.set(1500 / width, 1500 / width);

    const splatMap = new TextureLoader().load('resources/images/custom_heightmap2.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        textures: [grassTexture, snowyRockTexture],
        splatMaps: [splatMap]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    terrain.castShadow = true;
    terrain.receiveShadow = true;

    scene.add(terrain);

    //const skybox = new Mesh(new SphereBufferGeometry(100.0, 64, 64), new Skybox());
    //scene.add(skybox);
    // Note to self: Equirectangular

    const cubeLoader = new CubeTextureLoader();
    cubeLoader.setPath("resources/textures/CubeMap/");
    const skybox = cubeLoader.load([ 'pos_x.jpg', 'neg_x.jpg', 'pos_y.jpg', 'neg_y.jpg', 'pos_z.jpg', 'neg_z.jpg']);
    skybox.encoding = sRGBEncoding;
    scene.environment, scene.background = skybox; //new TextureLoader().load("resources/images/panorama.jpg");
    //scene.background = new TextureLoader().load("resources/images/panorama.jpg");
    //skybox.position.y = 0; // fjern når ferdig med testing

    // instantiate a GLTFLoader and load all models
    const loader = new GLTFLoader();
    ModelLoader.loadAllModels(scene,loader,width,terrainGeometry);
    
    Slepinir.loadSleipnir(scene, skybox);

    // for testing
    scene.add(new AmbientLight(0xffffff, 1));

    scene.add( new CameraHelper( sun.shadow.camera ) );


    renderer.physicallyCorrectLights = true;

    const canvas = renderer.domElement;
    const mouseLookController = new MouseLookController(camera, canvas, window, document);


    // Setup timeCycleController
    const timeSpeed = 24 * 60 * 4; // 1 day-cycle = 15 seconds, default = realtime
    const lightDistance = 1000;
    const timeCycleController = new TimeCycleController(timeSpeed, lightDistance, sun);

    // Setup clouds
    var cloudTab = []
    for(let i = 0; i < 100; i++) {
        if(i == 0) {
            var cloud = generateBillboardClouds(true);

        } else {
            var cloud = generateBillboardClouds(false);
        }
        cloudTab.push(cloud);
        scene.add(cloud);
    }

    // Setup water
    const waterNormalmap = new TextureLoader().load('resources/textures/Water/normalmap2.jpg');
    const planeGeometry = new PlaneBufferGeometry(100,100);
    const waterMaterial = new WaterMaterial(waterNormalmap);
    const water = new Mesh(planeGeometry,waterMaterial);
    scene.add(water);
    water.translateY(0.01);
    water.rotateX(Math.PI/2)

    let then = performance.now();
    function loop(now) {

        const delta = now - then;
        then = now;

        timeCycleController.cycleTime(delta);

        mouseLookController.moveCamera(delta);

        water.material.uniforms.time.value = timeCycleController.pureTimeTotal;
        water.material.uniforms.sunPosition.value = [timeCycleController.posX, timeCycleController.posY, 0];

        animateClouds(cloudTab);

        // render scene:
        renderer.render(scene, camera);

        requestAnimationFrame(loop);

    }

    loop(performance.now());

}

main(); // Start application