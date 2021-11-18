"use strict";

import * as THREE from "../lib/three.module.js";
import { TextureLoader } from "../lib/three.module.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";

const envIntensity = 1.0;

export default class Sleipnir {
    modelReady = false;
    model;
    mixer = THREE.AnimationMixer;
    clock = new THREE.Clock();

    constructor(root, envMap, light, x, z) {

        // NOTE: AO ruins model. Does not work well out of the box in Three JS. Even whites makes the model dark. Why?!?!
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
            "resources/models/tronds_stuff/sleipnir.glb",
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
                });

                if(light){
                    const hlColor = 0x9999ff;
                    const flIntensity = 100;
                    const hlDistance = 300;
                    const hlRight = new THREE.SpotLight(hlColor, flIntensity, hlDistance, 0.3, 1.0);
                    const hlLeft = new THREE.SpotLight(hlColor, flIntensity, hlDistance, 0.3, 1.0);
        
                    hlLeft.castShadow = true;
                    hlRight.castShadow = true;
                    hlLeft.shadow.mapSize.height = 128;
                    hlLeft.shadow.mapSize.width = 128;
                    hlRight.shadow.mapSize.height = 128;
                    hlRight.shadow.mapSize.width = 128;
                    hlRight.add(hlRight.target);
                    hlRight.target.position.set(-12, 0, 100);
                    hlLeft.add(hlLeft.target);
                    hlLeft.target.position.set(12, 0, 100);
        
                    model.getObjectByName("BodySides").add(hlRight);
                    model.getObjectByName("BodySides").add(hlLeft);
                    hlRight.position.set(-0.92, 4.93, 8.83);
                    hlLeft.position.set(0.92, 4.93, 8.83);
                }
                
                model.position.x = x;//-2.35;
                model.position.y = 10;
                model.position.z = -10;
                model.rotation.y = Math.PI/8;

                this.model = model;
                root.add(this.model);
                this.modelReady = true;
                
                //Animation
                this.mixer = new THREE.AnimationMixer(this.model);

                // The for all solution I found was typescript only. Hence:
                this.mixer.clipAction(object.animations[0]).play();
                this.mixer.clipAction(object.animations[1]).play();
                this.mixer.clipAction(object.animations[2]).play();
                this.mixer.clipAction(object.animations[3]).play();
                this.mixer.clipAction(object.animations[4]).play();
                this.mixer.clipAction(object.animations[5]).play();
                this.mixer.clipAction(object.animations[6]).play();
                this.mixer.clipAction(object.animations[7]).play();
                this.mixer.clipAction(object.animations[8]).play();
            },
            // Following gives possibly false errors. Could be due to performance issues.
            /*(error) => {
                console.error('Error loading model.', error);
            }*/
        );
    }
    animate() {
        //orbitControls.update()
        if (this.modelReady) {
            this.mixer.update(this.clock.getDelta())
        }  
    }
}
