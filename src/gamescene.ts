import Phaser from "phaser";
import { CardObject } from "./gameobjects/cardobject";
import type { Card } from "./abstracts/card";
import { createPilesList } from "./pilesdata";
import { addCardTextureFrames } from "./cardtexture";
import * as effectData from "./instdata";
import { vPath } from "./util";
import { TurnDisplay } from "./gameobjects/turndisplay";
import { Run, startRun } from "./run";

export class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
    }

    private progressRun: () => void = () => {};

    preload() {
        this.load.image("card", vPath("/image/card.png"));
        this.load.once("complete", () => {
            const cardTexture = this.textures.get("card");
            addCardTextureFrames(cardTexture);
        });
        this.load.image("turn_display", vPath("/image/turn_display.png"));
        this.load.once("complete", () => {
            const texture = this.textures.get("turn_display");
            texture.add("opponent", 0, 0, 0, 300, 100);
            texture.add("you", 0, 0, 100, 300, 100);
        });
    }

    create() {
        const run = startRun(this);
        this.progressRun = () => Run.progress(run);

        this.add.existing(new TurnDisplay(this, 200, 500));

        run.piles.forEach((targetPlayerPiles, pID) => {
            const { piles: sourcePlayerPiles, pileObjects } = createPilesList[pID](this);
            Object.assign(targetPlayerPiles, sourcePlayerPiles);
            for(const pileObject of Object.values(pileObjects)) {
                Run.addPileObject(this, run, pileObject);
            }
        });

        for(let pID = 0; pID < run.info.playerNum; pID++) {
            for(let i = 0; i < 10; i++) {
                const card: Card = run.board.createCard({ name: "foo" }, { isFront: false });
                const cardObject = new CardObject(this, run, card);
                this.add.existing(cardObject);
                run.cardObjects.add(cardObject);
                run.boardWindow.moveCard(card, { key: "deck", player: pID });
            }
        }

        this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
            if(e.key.toLowerCase() === "k") {
                run.instStreamManager.executeStream({
                    body: [
                        {
                            type: "call",
                            stream: effectData.systemStream.start,
                            params: []
                        }
                    ]
                });
            }
        });

        this.events.once("shutdown", () => {
            this.events.off("update");
        });
    }

    update() {
        this.progressRun();
    }
}