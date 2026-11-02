import Phaser from "phaser";

export const CARD_TEXTURE_DATA = {
    cardWidth: 70,
    cardHeight: 100,
    cardsPerRow: 10,
    keys: ["back", "attack1", "attack2"]
};

function getTextureWidth() {
    return CARD_TEXTURE_DATA.cardWidth * CARD_TEXTURE_DATA.cardsPerRow;
}

function getTextureHeight() {
    return CARD_TEXTURE_DATA.cardHeight * Math.ceil(CARD_TEXTURE_DATA.keys.length / CARD_TEXTURE_DATA.cardsPerRow);
}

export function addCardTextureFrames(texture: Phaser.Textures.Texture) {
    CARD_TEXTURE_DATA.keys.forEach((key, i) => {
        const x = (i % CARD_TEXTURE_DATA.cardsPerRow) * CARD_TEXTURE_DATA.cardWidth;
        const y = Math.floor(i / 10) * CARD_TEXTURE_DATA.cardHeight;
        texture.add(key, 0, x, y, CARD_TEXTURE_DATA.cardWidth, CARD_TEXTURE_DATA.cardHeight);
    });
}

function createCardTextureImageFromTextures(scene: Phaser.Scene) {
    const texture = scene.textures.createCanvas("card", getTextureWidth(), getTextureHeight());
    if(!texture) throw "unable to create canvas texture";
    CARD_TEXTURE_DATA.keys.forEach((key, i) => {
        const x = (i % CARD_TEXTURE_DATA.cardsPerRow) * CARD_TEXTURE_DATA.cardWidth;
        const y = Math.floor(i / 10) * CARD_TEXTURE_DATA.cardHeight;
        texture.drawFrame(key, 0, x, y);
    });
    texture.refresh();
}

export function createCardTextureImage(scene: Phaser.Scene): Promise<void> {
    for(const key of CARD_TEXTURE_DATA.keys) scene.load.image(key, `/assets/card_${key}.png`);
    return new Promise((res, rej) => {
        scene.load.start();
        scene.load.once("complete", () => {
            try {
                createCardTextureImageFromTextures(scene);
                res();
            } catch(e) {
                rej(e);
            } finally {
                for(const key of CARD_TEXTURE_DATA.keys) scene.textures.remove(key);
            }
        });
    });
}