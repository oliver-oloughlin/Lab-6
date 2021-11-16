"use strict";

import * as THREE from "../lib/three.module.js";
import { TextureLoader } from "../lib/three.module.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";

const envIntensity = 3.0;

export default class Sleipnir {
    static loadSleipnir(root, envMap) {
        let hyperDetail = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/HyperDetailRoof_albedo_alpha.jpg"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/HyperDetailRoof_metal.jpg"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/HyperDetailRoof_roughness.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/HyperDetailRoof_normal.jpg"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        });
    
        let detailing = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/Detailing_albedo_alpha.jpg"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/Detailing_metal.jpg"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/Detailing_roughness.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/Detailing_normal.jpg"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        });
        
        let bodySides = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/BodySides_albedo_alpha.jpg"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/BodySides_metal.jpg"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/BodySides_roughness.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/BodySides_normal.jpg"),
            //aoMap: new TextureLoader().load("resources/textures/Sleipnir/BodySides_ao.jpg"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        });
    
        let bogie = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/Bogie_albedo_alpha.jpg"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/Bogie_metal.jpg"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/Bogie_roughness.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/Bogie_normal.jpg"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        });
    
        let chassis = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/Chassis_albedo_alpha.jpg"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/Chassis_metal.jpg"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/Chassis_roughness.jpg"),
            //aoMap: new TextureLoader().load("resources/textures/Sleipnir/Chassis_ao.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/Chassis_normal.jpg"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        });
    
        let outerBody = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_albedo_alpha.jpg"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_metal.jpg"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_roughness.jpg"),
            //aoMap: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_ao.jpg"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_normal.jpg"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        });
    
        let headlights = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xeeeeee),
            emissive: new THREE.Color(0xffffff),
    
        });
        let rearLights = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xff2222),
            emissive: new THREE.Color(0xff4444),
            emissiveIntensity: 0.7,
        });
    
        //let pmrem = new THREE.PMREMGenerator().fromScene(scene);
        //pmrem.update(renderer);
    
        //let pmremUnpacker = new THREE.PMREM
        const loader = new GLTFLoader();
    
        loader.load(
            "resources/models/tronds_stuff/sleipnir.gltf",
            (object) => {
                const model = object.scene;
                model.getObjectByName("BodySides").material = bodySides;
                model.getObjectByName("Bogie").material = bogie;
                model.getObjectByName("Chassis").material = chassis;
                model.getObjectByName("Detailing").material = detailing;
                model.getObjectByName("HyperDetail").material = hyperDetail;
                model.getObjectByName("OuterBody").material = outerBody;
                model.getObjectByName("Headlights").material = headlights;
                model.getObjectByName("RearLights").material = rearLights;
    
            
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                })
                
                const hlColor = 0x9999ff;
                const flIntensity = 300;
                const hlDistance = 300;
                const hlRight = new THREE.SpotLight(hlColor, flIntensity, hlDistance, 0.3, 1.0);
                const hlLeft = new THREE.SpotLight(hlColor, flIntensity, hlDistance, 0.3, 1.0);
    
                hlLeft.castShadow = true;
                hlRight.castShadow = true;
                hlRight.add(hlRight.target);
                hlRight.target.position.set(-12, 0, 100);
                hlLeft.add(hlLeft.target);
                hlLeft.target.position.set(12, 0, 100);
    
                model.add(hlRight);
                model.add(hlLeft);
                hlRight.position.set(-0.92, 4.93, 8.83);
                hlLeft.position.set(0.92, 4.93, 8.83);
    
                
                //model.position.y = 10;
                root.add(model);
            },
            // Following gives possibly false errors. Could be due to performance issues.
            /*(error) => {
                console.error('Error loading model.', error);
            }*/
        );
    }
}
