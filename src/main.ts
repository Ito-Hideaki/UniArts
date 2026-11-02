import Phaser from "phaser";
import { GameScene } from "./gamescene";

addEventListener("DOMContentLoaded", () => {
    new Phaser.Game({
        width: 1920,
        height: 1080,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        parent: "game-box",
        scene: GameScene
    });
});