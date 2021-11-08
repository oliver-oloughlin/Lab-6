"use strict";

import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.castShadow = true;

const loader = new GLTFLoader();

export default class Slepinir {

    static loadSleipnir(scene) {
        console.log("Loading Sleipnir")
        loader.load(
            "resources/models/tronds_stuff/sleipnir.gltf",
            (object) => {
                const model = object.scene.clone();
                
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                })

                scene.add(model);
                model.position.y = 30;
                console.log("Sleipnir loaded")
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