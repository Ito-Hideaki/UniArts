import Phaser from "phaser";
import { CardObject } from "./cardobject";
import { Board } from "./abstracts/board";
import type { Card } from "./abstracts/card";
import { PileObject } from "./pileobject";
import { createPiles } from "./pilesdata";
import { BoardWindow } from "./abstracts/boardwindow";
import { InstStreamManager } from "./instexecutor";
import { addCardTextureFrames } from "./cardtexture";
import * as effectData from "./instdata";

export class GameScene extends Phaser.Scene {

    piles = new Set<PileObject>();
    cards = new Set<CardObject>();

    constructor() {
        super("game");
    }

    preload() {
        this.load.image("card", "/image/card.png");
        this.load.once("complete", () => {
            const cardTexture = this.textures.get("card");
            addCardTextureFrames(cardTexture);
        });
    }

    create() {

        const { piles, pileObjects } = createPiles(this);
        const board = new Board(piles);
        for(const key in pileObjects) {
            //@ts-ignore
            this.addPileObject(pileObjects[key]);
        }
        const boardWindow = new BoardWindow(board);
        const instStreamManager = new InstStreamManager(this, board, boardWindow);
        this.events.on("update", () => { instStreamManager.progress(); });

        for(let i = 0; i < 10; i++) {
            const card: Card = board.createCard({ name: "foo" }, { isFront: false });
            const cardObject = new CardObject(this, card);
            this.add.existing(cardObject);
            this.cards.add(cardObject);
            boardWindow.moveCard(card, "deck");
        }

        this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
            if(e.key.toLowerCase() === "k") {
                instStreamManager.executeStream({
                    body: [{
                        type: "for",
                        repeat: 3,
                        stream: effectData.commonStream.draw
                    }]
                });
            }
        });

        this.events.once("shutdown", () => {
            this.events.off("update");
        });
    }

    addPileObject(pile: PileObject) {
        this.add.existing(pile);
        this.piles.add(pile);
    }
}