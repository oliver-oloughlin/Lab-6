"use strict";

import * as THREE from "../lib/three.module.js";
import { TextureLoader } from "../lib/three.module.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";
import Rails from "./Rails.js";
import Sleipnir from "./Sleipnir.js";

const loader = new GLTFLoader();

const envIntensity = 1.0;

export default class Bridge {
    sleip;
    model;

    constructor(scene, envMap) {
        const resConcrete = 16;
        const concColor = new TextureLoader().load("resources/textures/Bridge/Concrete_BaseColor.jpg")
        concColor.wrapS = THREE.RepeatWrapping;
        concColor.wrapT = THREE.RepeatWrapping;
        concColor.repeat.set(resConcrete, resConcrete);

        const concRough = new TextureLoader().load("resources/textures/Bridge/Concrete_Roughness.jpg");
        concRough.wrapS = THREE.RepeatWrapping;
        concRough.wrapT = THREE.RepeatWrapping;
        concRough.repeat.set(resConcrete, resConcrete);

        const concNormal = new TextureLoader().load("resources/textures/Bridge/Concrete_Normal.jpg")
        concNormal.wrapS = THREE.RepeatWrapping;
        concNormal.wrapT = THREE.RepeatWrapping;
        concNormal.repeat.set(resConcrete, resConcrete);

        let concrete = new THREE.MeshStandardMaterial({
            map: concColor,
            roughnessMap: concRough,
            normalMap: concNormal,
            envMap: envMap,
            envMapIntensity: envIntensity,
        })

        const resGravel = 3;
        const gravColor = new TextureLoader().load("resources/textures/Bridge/Gravel_basecolor.jpg");
        gravColor.wrapS = THREE.RepeatWrapping;
        gravColor.wrapT = THREE.RepeatWrapping;
        gravColor.repeat.set(resGravel, resGravel);

        const gravRough = new TextureLoader().load("resources/textures/Bridge/Gravel_roughness.jpg");
        gravRough.wrapS = THREE.RepeatWrapping;
        gravRough.wrapT = THREE.RepeatWrapping;
        gravRough.repeat.set(resGravel, resGravel);

        const gravNormal = new TextureLoader().load("resources/textures/Bridge/Gravel_normal.jpg");
        gravNormal.wrapS = THREE.RepeatWrapping;
        gravNormal.wrapT = THREE.RepeatWrapping;
        gravNormal.repeat.set(resGravel, resGravel);

        const gravAO = new TextureLoader().load("resources/textures/Bridge/Gravel_ambientocclusion.jpg");
        gravAO.wrapS = THREE.RepeatWrapping;
        gravAO.wrapT = THREE.RepeatWrapping;
        gravAO.repeat.set(resGravel, resGravel);

        let gravel = new THREE.MeshStandardMaterial({
            map: gravColor,
            roughnessMap: gravRough,
            normalMap: gravNormal,
            aoMap: gravAO,
            envMap: envMap,
            envMapIntensity: envIntensity,
        })

        let blackout = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 1,
        });
        //let pmrem = new THREE.PMREMGenerator().fromScene(scene);
        //pmrem.update(renderer);

        //let pmremUnpacker = new THREE.PMREM
        let model = new THREE.Object3D();

        console.log("Loading Bridge")
        loader.load(
            "resources/models/tronds_stuff/Bridge.gltf",
            (object) => {
                model = object.scene.clone();
                
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = concrete;
                    }
                })

                model.getObjectByName("Gravel").material = gravel;
                model.getObjectByName("Blackout0").material = blackout;
                model.getObjectByName("Blackout1").material = blackout;
                
                //scene.add(model);
                model.position.y = 10;
                model.position.z = -10;
                model.rotation.y = Math.PI/8;
                this.model = model;
                scene.add(this.model);
                Rails.loadRails(this.model, envMap, 120);
            },
            (error) => {
                console.error('Error loading model.', error);
            }
        );
    }
    animate() {
        //this.sleip.animate();
    }
}