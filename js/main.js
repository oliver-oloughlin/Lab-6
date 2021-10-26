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
} from './lib/three.module.js';

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';
import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';
import Skybox from './shaders/Skybox.js';
import TimeCycleController from './controls/TimeCycleController.js';

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
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(1000, 1000, 0);
    directionalLight.castShadow = true;

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;

    scene.add(directionalLight);

    // Set direction
    directionalLight.target.position.set(0, 15, 0);
    scene.add(directionalLight.target);

    camera.position.z = 70;
    camera.position.y = 55;
    camera.rotation.x -= Math.PI * 0.25;


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

    const skybox = new Mesh(new SphereBufferGeometry(100.0, 64, 64), new Skybox());
    scene.add(skybox);
    skybox.position.y = 0; // fjern når ferdig med testing

    /**
     * Add trees
     */

    // instantiate a GLTFLoader:
    const loader = new GLTFLoader();

    loader.load(
        // resource URL
        'resources/models/kenney_nature_kit/tree_thin.glb',
        // called when resource is loaded
        (object) => {
            for (let x = -width/2; x < width/2; x += 1.3) {
                for (let z = -width/2; z < width/2; z += 1.3) {
                    
                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;

                    const height = terrainGeometry.getHeightAt(px, pz);
                    const heightL = terrainGeometry.getHeightAt(px - 1, pz);
                    const heightR = terrainGeometry.getHeightAt(px + 1, pz);
                    const heightB = terrainGeometry.getHeightAt(px, pz - 1);
                    const heightF = terrainGeometry.getHeightAt(px, pz + 1);

                    const diffL = Math.abs(height - heightL);
                    const diffR = Math.abs(height - heightR);
                    const diffB = Math.abs(height - heightB);
                    const diffF = Math.abs(height - heightF);

                    if (height > 0.35 * terrainGeometry.height && height < 0.75 * terrainGeometry.height && diffL < 0.07 && diffR < 0.07 && diffB < 0.07 && diffF < 0.07) {
                        const tree = object.scene.children[0].clone();

                        tree.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        
                        tree.position.x = px;
                        tree.position.y = height - 0.01;
                        tree.position.z = pz;

                        tree.rotation.y = Math.random() * (2 * Math.PI);

                        tree.scale.multiplyScalar(0.2 + Math.random() * 3);

                        scene.add(tree);
                    }

                }
            }
        },
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model.', error);
        }
    );

    loader.load(
        // resource URL
        'resources/models/flower/scene.gltf',
        // called when resource is loaded
        (object) => {
            for (let x = -width/2; x < width/2; x += 5) {
                for (let z = -width/2; z < width/2; z += 5) {
                    
                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;

                    const height = terrainGeometry.getHeightAt(px, pz);

                    if (height > 0 && height < 3) {
                        const flower = object.scene.children[0].clone();

                        flower.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        
                        flower.position.x = px;
                        flower.position.y = height - 0.01;
                        flower.position.z = pz;

                        flower.rotation.y = Math.random() * (Math.PI / 10);

                        flower.scale.multiplyScalar(Math.random() * 0.5);

                        scene.add(flower);
                    }

                }
            }
        },
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model.', error);
        }
    );

    /**
     * Set up camera controller:
     */

    const canvas = renderer.domElement;
    const mouseLookController = new MouseLookController(camera, canvas, window, document);

    const timeSpeed = 24 * 60 * 4;
    const lightDistance = 1000;
    const timeCycleController = new TimeCycleController(timeSpeed, lightDistance, directionalLight);

    let then = performance.now();
    function loop(now) {

        const delta = now - then;
        then = now;

        timeCycleController.cycleTime(delta);

        // feed uniform med (lightPosX, lightPosY) til skybox!
        //this.skybox.material.uniforms.sunDirection.value = (lightPosX, lightPosY);

        mouseLookController.moveCamera(delta);

        // render scene:
        renderer.render(scene, camera);

        requestAnimationFrame(loop);

    }

    loop(performance.now());

}

main(); // Start application