import { RunningEffect } from "./effect";
import { Run } from "../run";
import type { Card } from "../abstracts/card";
import { CardObject, findCardObject } from "../gameobjects/cardobject";

class RunningChooseCardEffect extends RunningEffect {
    constructor(run: Run, cardObjects: CardObject[]) {
        super();
    }

    progress(): boolean {
        return true;
    }
}

export function executeChooseCardEffect(run: Run, cards: Card[]): RunningChooseCardEffect {
    const cardObjects = cards.map(card => {
        return findCardObject(card, run.cardObjects);
    }).filter(obj => obj !== undefined);

    for(const cardObject of cardObjects) {
        cardObject.selectable = true;
    }

    return new RunningChooseCardEffect(run, cardObjects);
}