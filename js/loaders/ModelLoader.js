import { GLTFLoader } from "./GLTFLoader.js";
import { ArrowHelper, Color, Raycaster, Vector3 } from "../lib/three.module.js";

export default class ModelLoader {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;
        this.loader = new GLTFLoader();

    }

    loadTrees() {

        this.loader.load(
            // resource URL
            'resources/models/kenney_nature_kit/tree_thin.glb',
            // called when resource is loaded
            (object) => {

                const directionVec = new Vector3(0, -1, 0);
                const step = 20;
                const hwidth = this.terrain.geometry.width / 2;
                const radius = 10;

                console.log(hwidth);

                for (let x = -hwidth; x < hwidth; x += step) {
                    for (let z = -hwidth; z < hwidth; z += step) {

                        const originVec = new Vector3(x, this.terrain.geometry.height + 1, z);

                        const raycaster = new Raycaster({
                            origin: originVec,
                            direction: directionVec,
                            near: 0,
                            far: 1000,
                        });

                        //this.scene.add(new ArrowHelper(directionVec, originVec, 10, 0xffff00));

                        raycaster.layers.set(1);

                        const intersects = raycaster.intersectObject(this.scene, true);

                        console.log("NOPE");
                        
                        if (intersects.length === 0) continue;

                        console.log("YEP");

                        const intersect = intersects.pop();

                        for (let r = 1; r < radius; r++) {

                            const c = 2 * Math.PI * r;

                            for (let a = 0; a < c; a++) {

                                if (Math.random() * radius < r) continue;

                                const fracA = a / c;
                                const sinx = Math.sin(fracA * 2 * Math.PI);
                                const cosz = Math.cos(fracA * 2 * Math.PI);
                                const rx = r * sinx;
                                const rz = r * cosz;

                                const k1 = r;
                                const k2 = intersect.distance;
                                const h = Math.sqrt(k1*k1 + k2*k2);

                                const tempDirVec = new Vector3(rx, -h, rz).normalize();
                                raycaster.set(originVec, tempDirVec);
                                const tempIntersects = raycaster.intersectObject(this.scene, true);

                                this.scene.add(new ArrowHelper(tempDirVec, originVec, 10, 0xffff00));

                                if (tempIntersects.length === 0) continue;

                                const tempIntersect = tempIntersects.pop();
                                const point = tempIntersect.point();
                                
                                const tree = object.scene.children[0].clone();
                                tree.traverse((child) => {
                                    if (child.isMesh) {
                                        child.castShadow = true;
                                        child.receiveShadow = true;
                                    }
                                });
                                tree.position = point;
                                this.scene.add(tree);

                            }
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

    }

}