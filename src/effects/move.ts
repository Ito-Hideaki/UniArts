import { RunningEffect } from "./effect";
import { Run } from "../run";
import type { Card } from "../abstracts/card";
import { findCardObject } from "../gameobjects/cardobject";
import { getCards, getNumber } from "../instdecoder";
import type { EffectType } from "../inst";
import type { RunningInstStream } from "../instexecutor";

export class RunningMoveEffect extends RunningEffect {
    cardObjects;

    constructor(run: Run, cards: Card[]) {
        super();
        this.cardObjects = cards.map(card => findCardObject(card, run.cardObjects));
    }

    progress() {
        // const movingCard = this.cardObjects.find(cardObject => cardObject?.isMoving);
        // return Boolean(movingCard);
        return false;
    }
}

export function executeMoveEffect(run: Run, effect: EffectType["Move"], context: RunningInstStream) {
    const cards = getCards(effect.target, context.fullMemory, run.board);
    for(const card of cards) {
        if(effect.to) {
            const player = effect.to.player !== undefined ? getNumber(effect.to.player, context.fullMemory) : undefined;
            run.board.moveCard(card, { key: effect.to.key, player});
        } else {
            run.board.moveCard(card);
        }
    }
    return new RunningMoveEffect(run, cards);
}