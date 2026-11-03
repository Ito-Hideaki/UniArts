import Phaser from "phaser";
import type { Card } from "./abstracts/card";
import type { GameScene } from "./gamescene";
import { findPileObject } from "./pileobject";
import type { Pile } from "./abstracts/pile";

export class CardObject extends Phaser.GameObjects.Image {
    card;
    scene: GameScene;
    velocity = new Phaser.Math.Vector2();
    isMoving = false;

    constructor(scene: GameScene, card: Card) {
        super(scene, 0, 0, "card");
        this.scene = scene;
        this.card = card;

        this.setOrigin(0.5, 0.5);
        this.setScale(2.5);

        scene.events.on("update", this.update, this);
    }

    update(_: number, delta_ms: number) {
        this.updateFrame();

        if(this.card.pile) {
            const dest = this.getDestinationFromPile(this.card.pile);
            if(dest) {
                this.updatePosition(delta_ms, dest);
                this.updateDepth(delta_ms, dest.depth, dest.x);
            }
        }
    }

    private updateFrame() {
        if(this.card.state.isFront) {
            this.setFrame("attack1");
        } else this.setFrame("back");
    }

    private updatePosition(delta_ms: number, dest: { x: number; y: number; }) {
        const MIN_DISTANCE_SQ = 10;
        const MIN_SPEED_SQ = 10;

        const destVec = new Phaser.Math.Vector2(dest);
        const posDiff = destVec.clone().subtract(this);

        if (posDiff.lengthSq() < MIN_DISTANCE_SQ && this.velocity.lengthSq() < MIN_SPEED_SQ) {
            this.isMoving = false;
            this.velocity.set(0, 0);
            this.x = dest.x;
            this.y = dest.y;
        } else {
            this.isMoving = true;
            this.updatePositionSmoothly(delta_ms, destVec);
        }
    }

    private updatePositionSmoothly(delta_ms: number, destVec: Phaser.Math.Vector2) {
        const delta = delta_ms / 1000;

        const CARD_ACCELERATION_FACTOR = 200;
        const acceleration = destVec.clone().subtract(this).scale(CARD_ACCELERATION_FACTOR);
        this.velocity.add(acceleration.clone().scale(delta));

        const CARD_VELOCITY_DAMPING = 20;
        this.velocity.scale(1 - CARD_VELOCITY_DAMPING * delta);

        const delta_pos = this.velocity.clone().scale(delta);
        this.x += delta_pos.x;
        this.y += delta_pos.y;
    }

    private updateDepth(delta_ms: number, destDepth: number, destX: number) {
        if(Math.abs(this.depth - destX) < 0.5 || this.x - destX === 0) {
            this.depth = destDepth;
        } else {
            this.depth += delta_ms/1000 * this.velocity.x / (this.x - destX) * (this.depth - destDepth);
        }
    }

    private getDestinationFromPile(pile: Pile) {
        const pileObject = findPileObject(pile, this.scene.piles);
        if(!pileObject) return;

        const { x, y } = pileObject.getCardXY(this.card);
        const depth = pileObject.getCardDepth(this.card);
        return { x, y, depth };
    }
}

export function findCardObject(card: Card, cards: Set<CardObject>) {
    const cardObjects = [...cards.values()];
    return cardObjects.find(cardObject => {
        return cardObject.card === card;
    });
}