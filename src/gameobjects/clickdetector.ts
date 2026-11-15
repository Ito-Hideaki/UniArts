import Phaser from "phaser";

export class ClickDetector {
    pressed: boolean = false;

    constructor() {
    }

    onPointerDown() {
        this.pressed = true;
    }

    onPointerUp(): boolean {
        if(this.pressed) {
            this.pressed = false;
            return true;
        }
        return false;
    }

    onPointerOut() {
        this.pressed = false;
    }
}

export class ClickNotifier {
    detector;
    onPointerUp: () => void;
    gameObject: Phaser.GameObjects.GameObject;

    constructor(gameObject: Phaser.GameObjects.GameObject, listener: () => any) {
        this.detector = new ClickDetector();
        this.gameObject = gameObject;
        const detector = this.detector;
        this.onPointerUp = () => {
            const clicked = detector.onPointerUp();
            if(clicked) {
                listener();
            }
        };
        gameObject.on("pointerdown", detector.onPointerDown, detector);
        gameObject.on("pointerup", this.onPointerUp, this);
        gameObject.on("pointerout", detector.onPointerOut, detector);
    }

    removeEvents() {
        this.gameObject.off("pointerdown", this.detector.onPointerDown, this.detector);
        this.gameObject.off("pointerup", this.onPointerUp, this);
        this.gameObject.off("pointerout", this.detector.onPointerOut, this.detector);
    }
}