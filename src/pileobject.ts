import Phaser from "phaser";
import type { Pile } from "./abstracts/pile";
import type { Card } from "./abstracts/card";

export class PileObject extends Phaser.GameObjects.Image {
    pile;
    cardGap: { x: number; y: number; } = { x: 0, y: 0 };
    /** adjustment amount for the bottom card position relative to the pile wideness */
    bottomAdjustment: { x: number; y: number; } = { x: 0, y: 0 };
    constructor(scene: Phaser.Scene, pile: Pile, x: number, y: number) {
        super(scene, x, y, "__DEFAULT");
        this.pile = pile;
    }

    getBottomCardXY() {
        return {
            x: this.x - this.bottomAdjustment.x * (this.cardGap.x * (this.pile.cards.length - 1)),
            y: this.y - this.bottomAdjustment.y * (this.cardGap.y * (this.pile.cards.length - 1))
        }
    }

    getCardXY(card: Card) {
        const index = this.pile.cards.indexOf(card);
        if(index === -1) throw "the card was not in the pile";
        const { x: bottomX, y: bottomY } = this.getBottomCardXY();
        return {
            x: bottomX + this.cardGap.x * index,
            y: bottomY + this.cardGap.y * index
        };
    }

    getCardDepth(card: Card) {
        const index = this.pile.cards.indexOf(card);
        if(index === -1) throw "the card was not in the pile";
        return index;
    }
}

export function findPileObject(pile: Pile, piles: Set<PileObject>) {
    const pileObjects = [...piles.values()];
    return pileObjects.find(pileObject => {
        return pileObject.pile === pile;
    });
}