import Phaser from "phaser";
import type { GameScene } from "../gamescene";
import { getNumber } from "../instdecoder";

export class TurnDisplay extends Phaser.GameObjects.Image {
    scene: GameScene;
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, "turn_display", "you");
        scene.events.on("update", this.update, this);
        this.scene = scene;
    }

    update() {
        const currentPlayer = getNumber("current_player", this.scene.getRun().state);
        this.setFrame(currentPlayer === 0 ? "you" : "opponent");
    }
}