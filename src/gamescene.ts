import Phaser from "phaser";
import { CardObject } from "./gameobjects/cardobject";
import { Board } from "./abstracts/board";
import type { Card } from "./abstracts/card";
import { PileObject } from "./pileobject";
import { createPilesList } from "./pilesdata";
import { BoardWindow } from "./abstracts/boardwindow";
import { InstStreamManager } from "./instexecutor";
import { addCardTextureFrames } from "./cardtexture";
import * as effectData from "./instdata";
import { vPath } from "./util";
import type { GameInfo } from "./gameinfo";
import type { Pile } from "./abstracts/pile";

export class GameScene extends Phaser.Scene {

    piles = new Set<PileObject>();
    cards = new Set<CardObject>();

    //@ts-ignore
    info: GameInfo;

    constructor() {
        super("game");
    }

    preload() {
        this.load.image("card", vPath("/image/card.png"));
        this.load.once("complete", () => {
            const cardTexture = this.textures.get("card");
            addCardTextureFrames(cardTexture);
        });
    }

    create() {
        this.info = {
            playerNum: 2
        };
        const piles: { [k: string]: Pile }[] = [];
        for(let pID = 0; pID < this.info.playerNum; pID++) {
            const { piles: playerPiles, pileObjects } = createPilesList[pID](this);
            for(const pileObject of Object.values(pileObjects)) {
                this.addPileObject(pileObject);
            }
            piles.push(playerPiles);
        }
        const board = new Board(piles);
        const boardWindow = new BoardWindow(board);
        const instStreamManager = new InstStreamManager(this, board, boardWindow);
        this.events.on("update", () => { instStreamManager.progress(); });

        for(let pID = 0; pID < this.info.playerNum; pID++) {
            for(let i = 0; i < 10; i++) {
                const card: Card = board.createCard({ name: "foo" }, { isFront: false });
                const cardObject = new CardObject(this, card);
                this.add.existing(cardObject);
                this.cards.add(cardObject);
                boardWindow.moveCard(card, { key: "deck", player: pID });
            }
        }

        this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
            if(e.key.toLowerCase() === "k") {
                instStreamManager.executeStream({
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

    addPileObject(pile: PileObject) {
        this.add.existing(pile);
        this.piles.add(pile);
    }
}