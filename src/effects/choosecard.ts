import { RunningEffect } from "./effect";
import { Run } from "../run";
import type { Card } from "../abstracts/card";
import { CardObject, findCardObject } from "../gameobjects/cardobject";
import type { EffectType } from "../inst";
import type { RunningInstStream } from "../instexecutor";
import { FullMemory, getString } from "../instdecoder";

class RunningChooseCardEffect extends RunningEffect {
    submitted = false;
    effect;
    cardObjects;
    context;
    submitCardButton;
    scene;

    constructor(run: Run, effect: EffectType["ChooseCard"], context: RunningInstStream, cardObjects: CardObject[]) {
        super();
        this.effect = effect;
        this.cardObjects = cardObjects;
        this.context = context;
        this.submitCardButton = run.getUI("submitCardButton");
        this.scene = run.scene;

        for(const cardObject of cardObjects) {
            cardObject.selectable = true;
        }

        this.submitCardButton.job = "shiyou";
        this.scene.events.on("submit_card_button_click", this.onSubmit, this);
    }

    onSubmit() {
        const selected = this.cardObjects.filter(cardObject => cardObject.selected);
        if(selected.length >= 1) {
            for(const cardObject of this.cardObjects) {
                cardObject.selectable = false;
            }
            this.submitCardButton.job = "none";
            this.scene.events.off("submit_card_button_clicked", this.onSubmit, this);
            this.submitted = true;

            const submittedCards = selected.map(cardObject => cardObject.card);
            FullMemory.set(this.context.fullMemory, getString(this.effect.saveTo), submittedCards);
        }
    }

    progress(): boolean {
        return !this.submitted;
    }
}

export function executeChooseCardEffect(run: Run, effect: EffectType["ChooseCard"], context: RunningInstStream, cards: Card[]): RunningChooseCardEffect {
    const cardObjects = cards.map(card => {
        return findCardObject(card, run.cardObjects);
    }).filter(obj => obj !== undefined);

    return new RunningChooseCardEffect(run, effect, context, cardObjects);
}