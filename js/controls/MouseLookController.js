import {
    Quaternion,
    Vector3
} from '../lib/three.module.js';

export default class MouseLookController {

    constructor(camera, canvas, window, document) {
        
        this.camera = camera;

        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            speed: 0.05
        };

        this.velocity = new Vector3(0.0, 0.0, 0.0);
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = 0.001;

        this.FD = new Vector3(0, 0, 1);
        this.UD = new Vector3(0, 1, 0);
        this.LD = new Vector3(1, 0, 0);

        this.pitchQuaternion = new Quaternion();
        this.yawQuaternion = new Quaternion();

        canvas.addEventListener('mouseover', () => {
            canvas.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                canvas.addEventListener('mousemove', (e) => {
                    this.pitch += e.movementY * this.mouseSensitivity;
                    this.yaw += e.movementX * this.mouseSensitivity;
                }, false);
            } else {
                canvas.removeEventListener('mousemove', (e) => {}, false);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') {
                this.move.forward = true;
                e.preventDefault();
            } else if (e.code === 'KeyS') {
                this.move.backward = true;
                e.preventDefault();
            } else if (e.code === 'KeyA') {
                this.move.left = true;
                e.preventDefault();
            } else if (e.code === 'KeyD') {
                this.move.right = true;
                e.preventDefault();
            }
        });
    
        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') {
                this.move.forward = false;
                e.preventDefault();
            } else if (e.code === 'KeyS') {
                this.move.backward = false;
                e.preventDefault();
            } else if (e.code === 'KeyA') {
                this.move.left = false;
                e.preventDefault();
            } else if (e.code === 'KeyD') {
                this.move.right = false;
                e.preventDefault();
            }
        });

    }

    updateCamRotation(event) {
        this.yaw +=  event.movementX * this.mouseSensitivity;
        this.pitch += event.movementY * this.mouseSensitivity;
    }

    update() {
        
        this.pitchQuaternion.setFromAxisAngle(this.LD, -this.pitch);
        this.yawQuaternion.setFromAxisAngle(this.UD, -this.yaw);

        this.camera.setRotationFromQuaternion(this.yawQuaternion.multiply(this.camera.quaternion.multiply(this.pitchQuaternion)));

    }

    moveCamera(delta) {

        const moveSpeed = this.move.speed * delta;
        this.velocity.set(0.0, 0.0, 0.0);

        if (this.move.left) {
            this.velocity.x -= moveSpeed;
        }

        if (this.move.right) {
            this.velocity.x += moveSpeed;
        }

        if (this.move.forward) {
            this.velocity.z -= moveSpeed;
        }

        if (this.move.backward) {
            this.velocity.z += moveSpeed;
        }

        this.update();
        this.pitch = 0;
        this.yaw = 0;

        this.velocity.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(this.velocity);

    }
    
}