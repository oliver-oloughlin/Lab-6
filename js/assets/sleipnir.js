"use strict";

import * as THREE from "../lib/three.module.js";
import { TextureLoader } from "../lib/three.module.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const envIntensity = 1.0;

export default class Slepinir {

    static loadSleipnir(scene, envMap) {
        let hyperDetail = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/HyperDetailRoof_albedo_alpha.png"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/HyperDetailRoof_metal.png"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/HyperDetailRoof_roughness.png"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/HyperDetailRoof_normal.png"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        })

        let detailing = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/Detailing_albedo_alpha.png"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/Detailing_metal.png"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/Detailing_roughness.png"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/Detailing_normal.png"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        })
        
        let bodySides = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/BodySides_albedo_alpha.png"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/BodySides_metal.png"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/BodySides_roughness.png"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/BodySides_normal.png"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        })

        let bogie = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/Bogie_albedo_alpha.png"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/Bogie_metal.png"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/Bogie_roughness.png"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/Bogie_normal.png"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        })

        let chassis = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/Chassis_albedo_alpha.png"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/Chassis_metal.png"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/Chassis_roughness.png"),
            aoMap: new TextureLoader().load("resources/textures/Sleipnir/Chassis_ao.png"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/Chassis_normal.png"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        })

        let outerBody = new THREE.MeshStandardMaterial({
            map: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_albedo_alpha.png"),
            metalness: 1.0,
            metalnessMap: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_metal.png"),
            roughnessMap: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_roughness.png"),
            aoMap: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_ao.png"),
            normalMap: new TextureLoader().load("resources/textures/Sleipnir/OuterBody_normal.png"),
            envMap: envMap,
            envMapIntensity: envIntensity,
        })

        //let pmrem = new THREE.PMREMGenerator().fromScene(scene);
        //pmrem.update(renderer);

        //let pmremUnpacker = new THREE.PMREM

        console.log("Loading Sleipnir")
        loader.load(
            "resources/models/tronds_stuff/sleipnir.gltf",
            (object) => {
                const model = object.scene.clone();
                model.getObjectByName("BodySides").material = bodySides;
                model.getObjectByName("Bogie").material = bogie;
                model.getObjectByName("Chassis").material = chassis;
                model.getObjectByName("Detailing").material = detailing;
                model.getObjectByName("HyperDetail").material = hyperDetail;
                model.getObjectByName("OuterBody").material = outerBody;
                
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                })

                const hlColor = 0xeeeeff;
                const flIntensity = 300;
                const hlDistance = 300;
                const hlRight = new THREE.SpotLight(hlColor, flIntensity, hlDistance, 0.3, 1.0);
                const hlLeft = new THREE.SpotLight(hlColor, flIntensity, hlDistance, 0.3, 1.0);

                (hlRight, hlLeft).castShadow = true;
                hlRight.add(hlRight.target);
                hlRight.target.position.set(-12, 4.93, 100);
                hlLeft.add(hlLeft.target);
                hlLeft.target.position.set(12, 4.93, 100);

                model.add(hlRight);
                model.add(hlLeft);
                hlRight.position.set(-0.92, 4.93, 8.83);
                hlLeft.position.set(0.92, 4.93, 8.83);
                //spotlight2.position.set(-0.92, 4.93, 8.83);

                scene.add(model);
                model.position.y = 10;
                model.position.z = 40;
                model.rotation.y = 30;
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