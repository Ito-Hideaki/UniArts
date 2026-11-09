import Phaser from "phaser";

export class TurnDisplay extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "turn_display", "you");
    }
}