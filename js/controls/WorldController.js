import { Raycaster, Vector2 } from "../lib/three.module.js";

export default class WorldController {

    constructor(window, modelLoader, camera, scene) {

        this.modelLoader = modelLoader;
        this.camera = camera;
        this.scene = scene;
        this.doTimeCycle = true;

        window.addEventListener('keypress', (e) => {
            if (e.code === 'KeyF') {
                this.doTimeCycle = !this.doTimeCycle;
            } 
        });

        window.addEventListener('click', (e) => {

            console.log("CLICK");

            const raycaster = new Raycaster();
            const mouse = new Vector2();

            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            raycaster.layers.set(1);

            const intersects = raycaster.intersectObjects(this.scene.children);
            
            if (intersects.length !== 0) {

                const point = intersects[0].point;
                this.modelLoader.putTree(point);

            } else {
                console.log('NO INTERSECT');
            }

        })

    }

}