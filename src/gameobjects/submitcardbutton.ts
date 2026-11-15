import Phaser from "phaser";
import type { GameScene } from "../gamescene";

export class SubmitCardButton extends Phaser.GameObjects.Image {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, "button", "submit_card_button_shiyou");
    }
}