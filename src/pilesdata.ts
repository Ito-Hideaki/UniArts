import type { GameScene } from "./gamescene";
import { Pile } from "./abstracts/pile";
import { PileObject } from "./pileobject";

export function createPiles(scene: GameScene) {
    const deck = new Pile();
    const deckObject = new PileObject(scene, deck, 300, 800);
    deckObject.cardGap.y = -5;
    deckObject.cardGap.x = -10;

    const hands = new Pile();
    const handsObject = new PileObject(scene, hands, 1000, 900);
    handsObject.cardGap.x = 100;
    handsObject.bottomAdjustment.x = 0.5;

    const discarded = new Pile();
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
