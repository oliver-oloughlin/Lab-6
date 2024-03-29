import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    TextureLoader,
    DirectionalLight,
    AxesHelper,
    AmbientLight,
    PlaneBufferGeometry,
    CubeTextureLoader,
    CameraHelper,
    FogExp2,
    SphereBufferGeometry,
} from './lib/three.module.js';

import WaterMaterial from './materials/WaterMaterial.js';
import ModelLoader from './loaders/ModelLoader.js'
import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';
import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import { SimplexNoise } from './lib/SimplexNoise.js';
import TimeCycleController from './controls/TimeCycleController.js';
import WorldController from './controls/WorldController.js';
import Bridge from './assets/Bridge.js';
import {generateBillboardClouds, animateClouds} from './terrain/Cloud.js';
import Sleipnir from './assets/sleipnir.js';
import NewModelLoader from './lib/NewModelLoader.js';
import Skybox from './shaders/Skybox_failed_experimental.js';

async function main() {

    const scene = new Scene();

    //const axesHelper = new AxesHelper(15);
    //scene.add(axesHelper);

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

    const width = 150;

    /**
     * Add light
     */
    const sun = new DirectionalLight(0xffffff, 2);
    sun.position.set(1000, 1000, 0);
    sun.castShadow = true;

    //Set up shadow properties for the light

    const sunShadMapSize = 512;
    const shadownWidth = width/2;
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

    camera.position.z = 75;
    camera.position.y = 30;
    camera.position.x = -20;
    camera.rotation.x -= Math.PI * 0.2;

    /**
     * Add terrain:
     * 
     * We have to wait for the image file to be loaded by the browser.
     * There are many ways to handle asynchronous flow in your application.
     * We are using the async/await language constructs of Javascript:
     *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
     */
    const heightmapImage = await Utilities.loadImage('resources/images/heightmap.png');

    const simplex = new SimplexNoise();
    const terrainGeometry = new TerrainBufferGeometry({
        width,
        heightmapImage,
        noiseFn: simplex.noise.bind(simplex),
        numberOfSubdivisions: 512,
        height: 30
    });

    const heightMap = new TextureLoader().load('resources/images/rockmap.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        splatMaps: [heightMap]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);
    terrain.layers.enable(1);

    terrain.castShadow = true;
    terrain.receiveShadow = true;

    scene.add(terrain);    


    const cubeLoader = new CubeTextureLoader();
    cubeLoader.setPath("resources/textures/CubeMap/");
    const skybox = cubeLoader.load([ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    scene.environment, scene.background = skybox;

    let bridge = new Bridge(scene, skybox,);
    let sleip = new Sleipnir(scene, skybox, true, -2.35);
    let sleipStatic = new Sleipnir(scene, skybox, false, 2.35);
    
    // for testing
    scene.add(new AmbientLight(0xffffff, 0.3));

    //scene.add( new CameraHelper( sun.shadow.camera ) );


    renderer.physicallyCorrectLights = true;

    const canvas = renderer.domElement;
    const mouseLookController = new MouseLookController(camera, canvas, window, document);


    // Setup timeCycleController
    const timeSpeed = 24 * 60 * 2;
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

        // Sett høyden til skyene
        cloud.position.setY(60);
        scene.add(cloud);
    }
    scene.fog = new FogExp2(0xbbbbbb, 0.01);


    // Setup water
    const waterNormalMap = new TextureLoader().load('resources/textures/Water/normalmap.jpg');
    const waterFlowMap = new TextureLoader().load('resources/textures/Water/flowmap.png');
    const waterAlphaMap = new TextureLoader().load('resources/textures/Water/alphamap.jpg');
    const planeGeometry = new PlaneBufferGeometry(width, width, 1000, 1000);
    planeGeometry.receiveShadow = true;
    const waterMaterial = new WaterMaterial(waterNormalMap, waterFlowMap, waterAlphaMap);
    const water = new Mesh(planeGeometry,waterMaterial);
    scene.add(water);
    water.translateY(3.0);
    water.rotateX(Math.PI/2)

    // Model loaders
    const modelLoader = new ModelLoader(scene, terrain);

    const newLoader = new NewModelLoader(scene, terrainGeometry, width);
    newLoader.loadGrass(.8);
    newLoader.loadRocks(10);

    // Failed, experimental sky
    //scene.add(new Mesh(new SphereBufferGeometry(width, 32, 32), new Skybox));

    // Setup WorldController
    const worldController = new WorldController(window, modelLoader, camera, scene);

    // Render loop
    let then = performance.now();
    function loop(now) {

        const delta = now - then;
        then = now;

        // Cycle time if set to true
        if (worldController.doTimeCycle) {
            timeCycleController.cycleTime(delta);
        }

        mouseLookController.moveCamera(delta);

        // Update water uniforms
        water.material.uniforms.time.value = timeCycleController.pureTimeTotal;
        water.material.uniforms.sunPosition.value = sun.position;

        animateClouds(cloudTab);
        sleip.animate();

        // render scene:
        renderer.render(scene, camera);
        requestAnimationFrame(loop);

    }

    loop(performance.now());

}

main(); // Start application