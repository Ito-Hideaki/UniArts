import Phaser from "phaser";

export function addButtonTexture(scene: Phaser.Scene) {
    const buttonTexture = scene.textures.get("button");

    buttonTexture.add("submit_card_button_shiyou", 0, 0, 0, 200, 100);
}