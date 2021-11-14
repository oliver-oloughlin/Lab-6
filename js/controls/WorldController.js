export default class WorldController {

    constructor(window) {

        this.doTimeCycle = true;

        window.addEventListener('keypress', (e) => {
            if (e.code === 'KeyF') {
                this.doTimeCycle = !this.doTimeCycle;
            } 
        });

    }

}