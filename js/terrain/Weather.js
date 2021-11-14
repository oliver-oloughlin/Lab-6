import {
    Sprite,
    SpriteMaterial,
    TextureLoader
} from "../lib/three.module.js";

export function generateBillboardClouds() {
    var pX = Math.random() * -70 + 35;
    var pZ = Math.random() * -80 + 35;
    var pY = Math.random() * 5 + 35;
    var cloudTexture = new TextureLoader().load('resources/textures/Cloud/cloud4.png');
    var material = new SpriteMaterial({

        map: cloudTexture,
        transparent: true,
        opacity: 0.7,
        depthTest: true,
        depthWrite: true
    })

    var cloud = new Sprite(material);
    cloud.position.setX(pX + Math.round(Math.random() * 15));
    cloud.position.setY(pY + Math.round(Math.random() * 15));
    cloud.position.setZ(pZ + Math.round(Math.random() * 15));
    cloud.scale.set(20,  20);
    return cloud;
}

export function animateClouds(cloudTab) {
    for(let j = 0; j < cloudTab.length; j++) {
        cloudTab[j].material.rotation += 0.0005;
    }
}