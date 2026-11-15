import Phaser from "phaser";
import type { GameScene } from "../gamescene";
import { ClickNotifier } from "./clickdetector";

const ButtonJobType = {
    None: "none",
    Shiyou: "shiyou"
} as const;
type ButtonJob = typeof ButtonJobType[keyof typeof ButtonJobType];

export class SubmitCardButton extends Phaser.GameObjects.Image {

    job: ButtonJob = "none";
    clickNotifier: ClickNotifier;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, "button");
        scene.events.on("update", this.update, this);
        this.setInteractive();
        this.clickNotifier = new ClickNotifier(this, this.onClick.bind(this));
        this.once("destroy", () => {
            this.clickNotifier.removeEvents();
        }, this);
    }

    update() {
        if(this.job === "none") {
            this.setVisible(false);
        } else {
            this.setVisible(true);
            this.setFrame({
                "shiyou": "submit_card_button_shiyou"
            }[this.job]);
        }
    }

    onClick() {
        this.scene.events.emit("submit_card_button_click");
    }
}