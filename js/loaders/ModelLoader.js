import * as THREE from "../lib/three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";
import { ArrowHelper, Color, Raycaster, Vector3 } from "../lib/three.module.js";

export default class ModelLoader {

    treeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x229922),
        emissive: new THREE.Color(0x449944),
        emissiveIntensity: 0.3,
    });

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;
        this.loader = new GLTFLoader();

    }

    putTree(point) {

        this.loader.load(
            // resource URL
            'resources/models/kenney_nature_kit/tree_thin.glb',
            // called when resource is loaded
            (object) => {

                const tree = object.scene.children[0].clone();

                tree.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = this.treeMat;
                    }
                });
                
                tree.position.x = point.x;
                tree.position.y = point.y;
                tree.position.z = point.z;

                tree.rotation.y = Math.random() * (2 * Math.PI);

                tree.scale.multiplyScalar(1 + Math.random() * 2);

                this.scene.add(tree);
                
            },
            (xhr) => {
                console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model.', error);
            }
        );

    }

}