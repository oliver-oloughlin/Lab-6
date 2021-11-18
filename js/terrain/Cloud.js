import {
    DoubleSide,
    Sprite,
    SpriteMaterial,
    TextureLoader
} from "../lib/three.module.js";

export function generateBillboardClouds() {
    var pX = Math.random() * -130 + 60;
    var pY = Math.random() * 10 + 60;
    var pZ = Math.random() * -130 + 60;
    var cloudTexture = new TextureLoader().load('resources/textures/Cloud/cloud.png');

    var material = new SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.5
    })

    var cloud = new Sprite(material);
    cloud.position.setX(pX + Math.round(Math.random() * 20));
    cloud.position.setY(pY + Math.round(Math.random() * 20));
    cloud.position.setZ(pZ + Math.round(Math.random() * 20));
    cloud.scale.set(20,  20);
    return cloud;
}

export function animateClouds(cloudTab) {
    for(let i = 0; i < cloudTab.length; i++) {
        cloudTab[i].material.rotation += 0.001;
    }
}