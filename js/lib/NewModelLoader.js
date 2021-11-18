import {GLTFLoader} from "../loaders/GLTFLoader.js";
import { DoubleSide, DynamicDrawUsage, InstancedMesh, MeshStandardMaterial, Object3D, ObjectSpaceNormalMap, TextureLoader } from "./three.module.js";

/*
Instancing solution based on this one: https://githubmemory.com/repo/troisjs/trois/issues/76
*/

export default class NewModelLoader {

    constructor(scene, terrain, width) {
        this.scene = scene;
        this.terrain = terrain;
        this.width = width;
    }

    loadGrass(density) {
        const loader = new GLTFLoader();

        const grassMaterial = new MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Grass/Billboard_4K_Albedo.jpg"),
            alphaMap: new TextureLoader().load("resources/textures/Grass/Billboard_4K_Opacity.jpg"),
            depthWrite: false,
            transparent: true,
            side: DoubleSide,
        });
        //grassMaterial.depthWrite = true;
        loader.load(
            "resources/models/tronds_stuff/Grass.glb",
            (object) => {
                const geo = object.scene.children[0].geometry.clone();

                let width = this.width/2;

                let instances = 0;
                let pxArr = [];
                let pyArr = [];
                let pzArr = [];

                // Instance count calculation - also saves found placement points for placement of instances

                let res = density;
                let maxDiff = 1.2;
                for (let x = -width; x < width; x += res) {
                    for (let z = -width; z < width; z += res) {                        
                        const px = x + 1 + (6 * Math.random()) - res;
                        const pz = z + 1 + (6 * Math.random()) - res;
    
                        const height = this.terrain.getHeightAt(px, pz);
                        const heightL = this.terrain.getHeightAt(px - 1, pz);
                        const heightR = this.terrain.getHeightAt(px + 1, pz);
                        const heightB = this.terrain.getHeightAt(px, pz - 1);
                        const heightF = this.terrain.getHeightAt(px, pz + 1);
    
                        const diffL = Math.abs(height - heightL);
                        const diffR = Math.abs(height - heightR);
                        const diffB = Math.abs(height - heightB);
                        const diffF = Math.abs(height - heightF);
    
                        //if (height > 3.1 && height < 30) {
                        if (height > 3.1 && height < 30 && diffL < maxDiff && diffR < maxDiff && diffB < maxDiff && diffF < maxDiff) {
                            instances++;
                            pxArr.push(px);
                            pyArr.push(height);
                            pzArr.push(pz);
                        }
                    }
                }

                console.log("Instances of grass: " + instances);

                let instanced = new InstancedMesh(geo, grassMaterial, instances);
                instanced.receiveShadow = true;
                instanced.instanceMatrix.setUsage(DynamicDrawUsage);

                let dummy = new Object3D();

                // Instance populating
                for (let i = 0; i < instances; i++){
                    dummy.position.set(pxArr[i], pyArr[i], pzArr[i])
                    dummy.rotation.set(0, Math.random() * 2, 0);
                    let scale = Math.random() * 1 + 0.5;
                    dummy.scale.set(scale, scale, scale);
                    dummy.updateMatrix();
                    instanced.setMatrixAt(i, dummy.matrix);
                }
                this.scene.add(instanced);
            },
            (xhr) => {
                console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model.', error);
            }
        );
    }

    loadRocks(density) {
        const loader = new GLTFLoader();

        const grassMaterial = new MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Rock/shopk_2K_Albedo.jpg"),
            roughnessMap: new TextureLoader().load("resources/textures/Rock/shopk_2K_Roughness.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Rock/shopk_2K_Normal_LOD0.jpg"),
            //normalMapType: ObjectSpaceNormalMap,
        });
        //grassMaterial.depthWrite = true;
        loader.load(
            "resources/models/tronds_stuff/Rock.glb",
            (object) => {
                const geo = object.scene.children[0].geometry.clone();

                let width = this.width/2;

                let instances = 0;
                let pxArr = [];
                let pyArr = [];
                let pzArr = [];

                // Instance count calculation - also saves found placement points for placement of instances

                let res = 5;
                let maxDiff = 0.6;
                for (let x = -width; x < width; x += res) {
                    for (let z = -width; z < width; z += res) {                        
                        const px = x + 1 + (6 * Math.random()) - res;
                        const pz = z + 1 + (6 * Math.random()) - res;
    
                        const height = this.terrain.getHeightAt(px, pz);
                        const heightL = this.terrain.getHeightAt(px - 1, pz);
                        const heightR = this.terrain.getHeightAt(px + 1, pz);
                        const heightB = this.terrain.getHeightAt(px, pz - 1);
                        const heightF = this.terrain.getHeightAt(px, pz + 1);
    
                        const diffL = Math.abs(height - heightL);
                        const diffR = Math.abs(height - heightR);
                        const diffB = Math.abs(height - heightB);
                        const diffF = Math.abs(height - heightF);
    
                        //if (height > 3.1 && height < 30) {
                        if (height > 0 && height < 30 && diffL < maxDiff && diffR < maxDiff && diffB < maxDiff && diffF < maxDiff) {
                            instances++;
                            pxArr.push(px);
                            pyArr.push(height);
                            pzArr.push(pz);
                        }
                    }
                }

                let instanced = new InstancedMesh(geo, grassMaterial, instances);
                instanced.receiveShadow = true;
                instanced.castShadow = true;
                instanced.instanceMatrix.setUsage(DynamicDrawUsage);

                let dummy = new Object3D();

                // Instance populating
                for (let i = 0; i < instances; i++){
                    dummy.position.set(pxArr[i], pyArr[i] -0.6, pzArr[i])
                    dummy.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
                    let scale = Math.random() * 2 + 0.2;
                    dummy.scale.set(scale, scale, scale);
                    dummy.updateMatrix();
                    instanced.setMatrixAt(i, dummy.matrix);
                }
                this.scene.add(instanced);
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