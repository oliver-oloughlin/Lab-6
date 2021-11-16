"use strict";

import * as THREE from "../lib/three.module.js";
import { TextureLoader } from "../lib/three.module.js";
import {GLTFLoader} from "../loaders/GLTFLoader.js";
import Sleipnir from "./Sleipnir.js";

const loader = new GLTFLoader();

const envIntensity = 3.0;

export default class Bridge {

    static loadBrdige(scene, envMap) {
        const resConcrete = 20;
        const concColor = new TextureLoader().load("resources/textures/Bridge/Concrete_BaseColor.png")
        concColor.wrapS = THREE.RepeatWrapping;
        concColor.wrapT = THREE.RepeatWrapping;
        concColor.repeat.set(resConcrete, resConcrete);

        const concRough = new TextureLoader().load("resources/textures/Bridge/Concrete_Roughness.png");
        concRough.wrapS = THREE.RepeatWrapping;
        concRough.wrapT = THREE.RepeatWrapping;
        concRough.repeat.set(resConcrete, resConcrete);

        const concNormal = new TextureLoader().load("resources/textures/Bridge/Concrete_Normal.png")
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
        const gravColor = new TextureLoader().load("resources/textures/Bridge/026_TB_Gravel_road_1024_basecolor.png");
        gravColor.wrapS = THREE.RepeatWrapping;
        gravColor.wrapT = THREE.RepeatWrapping;
        gravColor.repeat.set(resGravel, resGravel);

        const gravRough = new TextureLoader().load("resources/textures/Bridge/026_TB_Gravel_road_1024_roughness.png");
        gravRough.wrapS = THREE.RepeatWrapping;
        gravRough.wrapT = THREE.RepeatWrapping;
        gravRough.repeat.set(resGravel, resGravel);

        const gravNormal = new TextureLoader().load("resources/textures/Bridge/026_TB_Gravel_road_1024_normal.png");
        gravNormal.wrapS = THREE.RepeatWrapping;
        gravNormal.wrapT = THREE.RepeatWrapping;
        gravNormal.repeat.set(resGravel, resGravel);

        const gravAO = new TextureLoader().load("resources/textures/Bridge/026_TB_Gravel_road_1024_normal.png");
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
                
                //scene.add(model);
                model.position.y = 15;
                model.position.z = 0;
                model.rotation.y = 70;
                scene.add(model);
                Sleipnir.loadSleipnir(model, envMap);
            },
            (error) => {
                console.error('Error loading model.', error);
            }
        );
    }
}