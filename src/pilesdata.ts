import type { GameScene } from "./gamescene";
import { Pile } from "./abstracts/pile";
import { PileObject } from "./pileobject";

function createPiles0(scene: GameScene) {
    const deck = new Pile(0);
    const deckObject = new PileObject(scene, deck, 300, 800);
    deckObject.cardGap.y = -5;
    deckObject.cardGap.x = -10;

    const hands = new Pile(0);
    const handsObject = new PileObject(scene, hands, 1000, 900);
    handsObject.cardGap.x = 100;
    handsObject.bottomAdjustment.x = 0.5;

    const discarded = new Pile(0);
    const discardedObject = new PileObject(scene, discarded, 1600, 800);
    discardedObject.cardGap.y = -5;

    return {
        piles: {
            deck,
            hands,
            discarded
        },
        pileObjects: {
            deck: deckObject,
            hands: handsObject,
            discarded: discardedObject
        }
    }
}

function createPiles1(scene: GameScene) {
    const screenW = scene.game.canvas.width;
    const screenH = scene.game.canvas.height;
    const deck = new Pile(1);
    const deckObject = new PileObject(scene, deck, screenW - 300, screenH - 800);
    deckObject.cardGap.y = 5;
    deckObject.cardGap.x = 10;

    const hands = new Pile(1);
    const handsObject = new PileObject(scene, hands, screenW - 1000, screenH - 900);
    handsObject.cardGap.x = -100;
    handsObject.bottomAdjustment.x = 0.5;

    const discarded = new Pile(1);
    const discardedObject = new PileObject(scene, discarded, screenH - 1600, screenW - 800);
    discardedObject.cardGap.y = 5;

    return {
        piles: {
            deck,
            hands,
            discarded
        },
        pileObjects: {
            deck: deckObject,
            hands: handsObject,
            discarded: discardedObject
        }
    }
}

export const createPilesList = [createPiles0, createPiles1];