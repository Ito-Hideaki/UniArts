import Phaser from "phaser";
import type { GameScene } from "../gamescene";
import { Run } from "../run";

export class TurnDisplay extends Phaser.GameObjects.Image {
    scene: GameScene;
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, "turn_display", "you");
        scene.events.on("update", this.update, this);
        this.scene = scene;
    }

    update() {
        const currentPlayer = Run.getNumberState(this.scene.getRun(), "current_player");
        this.setFrame(currentPlayer === 0 ? "you" : "opponent");
    }
}