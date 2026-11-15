import Phaser from "phaser";
import { CardObject } from "./gameobjects/cardobject";
import type { Card } from "./abstracts/card";
import { createPilesList } from "./pilesdata";
import { addCardTextureFrames } from "./texture/cardtexture";
import { commonStream, systemStream } from "./instdata";
import { vPath } from "./util";
import { TurnDisplay } from "./gameobjects/turndisplay";
import { Run, startRun } from "./run";
import { addButtonTexture } from "./texture/buttontexture";
import { SubmitCardButton } from "./gameobjects/submitcardbutton";
import { CARD_DATA } from "./gamedata/carddata";

export class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
    }

    private run: Run | undefined;
    ui: {
        submitCardButton?: SubmitCardButton
    } = {};

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
        this.load.image("button", vPath("/image/button.png"));
        this.load.once("complete", () => addButtonTexture(this));
    }

    create() {
        this.ui.submitCardButton = new SubmitCardButton(this, 1500, 700);
        this.add.existing(this.ui.submitCardButton);
        this.add.existing(new TurnDisplay(this, 200, 500));

        const run = startRun(this);
        this.run = run;

        run.piles.forEach((targetPlayerPiles, pID) => {
            const { piles: sourcePlayerPiles, pileObjects } = createPilesList[pID](this);
            Object.assign(targetPlayerPiles, sourcePlayerPiles);
            for(const pileObject of Object.values(pileObjects)) {
                Run.addPileObject(this, run, pileObject);
            }
        });

        for(let pID = 0; pID < run.info.playerNum; pID++) {
            for(let i = 0; i < 10; i++) {
                const card: Card = run.board.createCard(CARD_DATA.sample.info, { isFront: false });
                const cardObject = new CardObject(run, card);
                this.add.existing(cardObject);
                run.cardObjects.add(cardObject);
                run.board.moveCard(card, { key: "deck", player: pID });
            }
        }

        for(const key in commonStream) {
            run.registeredStream.set("common." + key, commonStream[key]);
        }
        for(const key in systemStream) {
            run.registeredStream.set("system." + key, systemStream[key]);
        }
        for(const key in CARD_DATA) {
            const data = CARD_DATA[key];
            for(const streamKey in data.stream) {
                run.registeredStream.set(`${key}_${streamKey}`, data.stream[streamKey]);
            }
        }

        this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
            if(e.key.toLowerCase() === "k") {
                run.get.instStreamManager().executeStream({
                    body: [
                        {
                            type: "call",
                            stream: "system.start",
                            params: []
                        }
                    ]
                });
            }

            if(e.key.toLowerCase() === "r") {
                this.scene.start("game");
            }
        });

        this.events.once("shutdown", () => {
            this.events.off("update");
            this.input.keyboard?.off("keydown");
        });
    }

    update() {
        if(this.run) Run.progress(this.run);
    }

    getRun() {
        if(!this.run) throw "run is not set";
        return this.run;
    }
    getUI<T extends keyof GameScene["ui"]>(key: T) {
        const ui = this.ui[key];
        if(!ui) {
            throw `scene UI ${key} is not initialized`;
        }
        return ui;
    }
}