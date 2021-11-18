"use strict";

import * as THREE from "../lib/three.module.js";
import { TextureLoader } from "../lib/three.module.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";

const envIntensity = 1.0;

export default class Rails{
    static loadRails(root, envMap, length) {
        let sleeperMat = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Track_Sleepers/norwegian_concrete_sleepers_BaseColor.jpg"),
            metalness: 0.0,
            roughnessMap: new TextureLoader().load("resources/textures/Track_Sleepers/norwegian_concrete_sleepers_Roughness.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Track_Sleepers/norwegian_concrete_sleepers_Normal.jpg"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        });

        let railMat = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Track_Sleepers/60e1_BaseColor.jpg"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Track_Sleepers/60e1_Metallic.jpg"),
            roughnessMap: new TextureLoader().load("resources/textures/Track_Sleepers/60e1_Roughness.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Track_Sleepers/60e1_Normal.jpg"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        });

        length = length/2;
        const loader = new GLTFLoader();
        loader.load(
            "resources/models/tronds_stuff/Sleeper.gltf",
            (object) => {
                const model = object.scene.children[0];
                model.material = sleeperMat;
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        }
                    })
                

                for (let z = -length; z < length; z+=0.6){
                    const sleeperL = model.clone();
                    const sleeperR = model.clone();

                    sleeperL.position.z = z;
                    sleeperL.position.x = -2.35;
                    sleeperR.position.z = z;
                    sleeperR.position.x = 2.35;
                    
                    root.add(sleeperL);
                    root.add(sleeperR);
                }
            },
        );

        loader.load(
            "resources/models/tronds_stuff/Rail.gltf",
            (object) => {
                const model = object.scene.children[0];
                model.material = railMat;
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        }
                    })
                

                for (let z = -length+4; z < length; z+=8){
                    const railL = model.clone();
                    const railR = model.clone();

                    railL.position.z = z;
                    railL.position.x = -2.35;
                    railR.position.z = z;
                    railR.position.x = 2.35;
                    
                    root.add(railL);
                    root.add(railR);
                }
            },
        );
    }
}
