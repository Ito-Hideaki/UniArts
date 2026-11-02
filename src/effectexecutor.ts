import type { Board } from "./abstracts/board";
import type { BoardWindow } from "./abstracts/boardwindow";
import type { Card } from "./abstracts/card";
import { findCardObject } from "./cardobject";
import type { Effect, EffectType, InstStream, Selector } from "./effect";
import type { GameScene } from "./gamescene";

class RunningEffect {
    constructor() {
    }

    /** @return if it's still running or not */
    progress(): boolean {
        return true;
    }
}

class RunningMoveEffect extends RunningEffect {
    cardObjects;

    constructor(scene: GameScene, cards: Card[]) {
        super();
        this.cardObjects = cards.map(card => findCardObject(card, scene.cards));
    }

    progress() {
        // const movingCard = this.cardObjects.find(cardObject => cardObject?.isMoving);
        // return Boolean(movingCard);
        return false;
    }
}

class RunningForEffect extends RunningEffect {
    running: RunningInstStream;
    counter;
    instExecutor;
    effect;

    constructor(effect: EffectType["For"], instExecutor: InstExecutor) {
        super();
        this.instExecutor = instExecutor;
        this.counter = 0;
        this.effect = effect;
        this.running = new RunningInstStream(instExecutor, effect.stream);
    }

    progress(): boolean {
        while(!this.running.progress()) {
            this.counter++;
            if(this.counter >= this.effect.repeat) return false;
            this.running = new RunningInstStream(this.instExecutor, this.effect.stream);
        }
        return true;
    }
}

class RunningTimeoutEffect extends RunningEffect {
    expired = false;
    constructor(scene: GameScene, effect: EffectType["Timeout"]) {
        super();
        scene.time.delayedCall(effect.duration, () => {
            this.expired = true;
        });
    }

    progress(): boolean {
        return !this.expired;
    }
}

export class InstExecutor {
    boardWindow;
    board;
    scene;

    constructor(scene: GameScene, board: Board, window: BoardWindow) {
        this.boardWindow = window;
        this.board = board;
        this.scene = scene;
    }

    executeEffect(effect: Effect, context: RunningInstStream): false | RunningEffect {
        try {
            switch(effect.type) {
                case "test":
                    return false;
                case "save_as":
                    const cardsToSave = this.selectCard(effect.target, context);
                    context.memory.set(effect.key, cardsToSave);
                    return false;
                case "move": {
                    const cards = this.selectCard(effect.target, context);
                    for(const card of cards) this.boardWindow.moveCard(card, effect.to);
                    return new RunningMoveEffect(this.scene, cards);
                }
                case "flip":
                    const cards = this.selectCard(effect.target, context);
                    for(const card of cards) {
                        this.boardWindow.flipCard(card, effect.isFront);
                    }
                    return false;
                case "for":
                    return new RunningForEffect(effect, this);
                case "timeout":
                    return new RunningTimeoutEffect(this.scene, effect);
            }
        } catch(e) {
            console.error(e);
        }
        return false;
    }

    selectCard(selector: Selector, context: RunningInstStream): Card[] {
        switch(selector.type) {
            case "pile":
                if(!this.board.piles[selector.pile]) return [];
                return this.board.piles[selector.pile].cards.slice();
            case "top":
                const sourceCards = this.selectCard(selector.source, context);
                return sourceCards.slice(-selector.max);
            case "load":
                return context.memory.get(selector.key) ?? [];
        }
    }
}

class RunningInstStream {
    memory = new Map<string | number, Card[]>();
    runningIndex = 0;
    runningEffect: RunningEffect | undefined;
    stream;
    instExecutor;

    constructor(instExecutor: InstExecutor, stream: InstStream) {
        this.stream = stream;
        this.instExecutor = instExecutor;
    }

    /** @return if it's still running or not */
    progress(): boolean {
        while(this.runningIndex < this.stream.body.length) {
            if(this.isRunningAfterProgression()) return true;
            this.runningEffect = undefined;
            this.runningIndex++;
        }
        return false;
    }

    private isRunningAfterProgression()  {
        if (this.runningEffect) {
            return this.runningEffect.progress();
        } else {
            const inst = this.stream.body[this.runningIndex];
            if (inst.type === "jump") throw "not implemented yet";
            this.runningEffect = this.instExecutor.executeEffect(inst, this) || undefined;
            return Boolean(this.runningEffect && this.runningEffect.progress());
        }
    }
}

export class InstStreamManager {
    instExecutor;
    running: RunningInstStream | undefined;

    constructor(scene: GameScene, board: Board, window: BoardWindow) {
        this.instExecutor = new InstExecutor(scene, board, window);
    }

    executeStream(stream: InstStream) {
        if(this.running) throw "not finished previous stream yet";
        this.running = new RunningInstStream(this.instExecutor, stream);
    }

    /** @return if it's completed or not (running) */
    progress(): boolean {
        if(!this.running) return true;
        if (!this.running.progress()) {
            this.running = undefined;
            return true;
        } else return false;
    }
}
