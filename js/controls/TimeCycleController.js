const timeMax = 1000 * 60 * 60 * 24;

export default class TimeCycleController {

    constructor(timeSpeed = 1, lightDistance = 1000, directionalLight) {

    this.time = timeMax / 2;
    this.timeSpeed = timeSpeed;
    this.lightDistance = lightDistance;
    this.directionalLight = directionalLight;

    this.timeFrac = 0.5;
    this.posX = 0;
    this.posY = -this.lightDistance;

    }

    setTimeSpeed(timeSpeed) {
        this.timeSpeed = timeSpeed;
    }

    setLightDistance(lightDistance) {
        this.lightDistance = lightDistance;
    }

    cycleTime(deltaTime) {

    this.time += deltaTime * this.timeSpeed;

    if (this.time >= timeMax) this.time = 0;

    this.timeFrac = this.time === 0 ? 0 : this.time / timeMax;
    const nowPI = this.timeFrac * 2 * Math.PI;
    const sinx = Math.sin(nowPI);
    const siny = Math.sin(nowPI - 1/2 * Math.PI);
    this.posX = sinx * this.lightDistance;
    this.posY = siny * this.lightDistance;

    this.directionalLight.position.set(this.posX, this.posY)

    }

}