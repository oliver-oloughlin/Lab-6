"use strict";

import * as THREE from "../lib/three.module.js";
import { TextureLoader } from "../lib/three.module.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";

const envIntensity = 3.0;

export default class Rails{
    static loadRails(root, envMap) {
        let hyperDetail = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xff2222),
            emissive: new THREE.Color(0xff4444),
            emissiveIntensity: 0.7,
        });

        const loader = new GLTFLoader();

        loader.load(
            "resources/models/tronds_stuff/Sleeper.gltf",
            (object) => {
                const model = object.scene;
                model.material = hyperDetail;
    
            
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                })
    
                
                //model.position.y = 10;
                root.add(model);
            },
        );
    }
}
