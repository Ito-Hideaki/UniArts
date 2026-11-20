import { RunningEffect } from "./effect";
import { Run } from "../run";
import type { Card } from "../abstracts/card";
import { CardObject, findCardObject } from "../gameobjects/cardobject";
import type { EffectType } from "../inst";
import type { RunningInstStream } from "../instexecutor";
import { FullMemory, getNumber } from "../instdecoder";

class RunningChooseCardEffect extends RunningEffect {
    submitted = false;
    effect;
    selectedCardQueue: CardObject[] = [];
    cardObjects;
    context;
    submitCardButton;
    scene;
    max: number | undefined;
    run;

    constructor(run: Run, effect: EffectType["ChooseCard"], context: RunningInstStream, cardObjects: CardObject[]) {
        super();
        this.effect = effect;
        this.cardObjects = cardObjects;
        this.context = context;
        this.submitCardButton = run.getUI("submitCardButton");
        this.scene = run.scene;
        this.max = effect.max !== undefined ? getNumber(effect.max, context.fullMemory) : undefined;
        this.run = run;

        for(const cardObject of cardObjects) {
            cardObject.selectable = true;
            cardObject.on("click", () => { this.onCardClick(cardObject); });
        }

        this.submitCardButton.job = "shiyou";
        this.scene.events.on("submit_card_button_click", this.onSubmit, this);
    }

    onCardClick(cardObject: CardObject) {

        const nextSelected = !cardObject.selected;
        if(nextSelected) {
            const canAddCard = this.max === undefined || this.max > 0;
            if(canAddCard) {
                const selectedQueueIsFull = this.max !== undefined && this.selectedCardQueue.length >= this.max;
                if(selectedQueueIsFull) {
                    const unselected = this.selectedCardQueue.splice(0, 1);
                    unselected[0].selected = false;
                }
                cardObject.selected = true;
                this.selectedCardQueue.push(cardObject);
            }
        } else {
            const index = this.selectedCardQueue.indexOf(cardObject);
            const unselected = this.selectedCardQueue.splice(index, 1);
            unselected[0].selected = false;
        }
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
            const keyToSubmit = FullMemory.getKeyFromEntry(this.context.fullMemory, this.effect.saveTo);
            FullMemory.set(this.context.fullMemory, keyToSubmit, submittedCards);
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