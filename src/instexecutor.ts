import type { Board } from "./abstracts/board";
import type { BoardWindow } from "./abstracts/boardwindow";
import type { Card } from "./abstracts/card";
import { findCardObject } from "./cardobject";
import { isEffect, type Control, type ControlType, type Effect, type EffectType, type InstStream, type MemoryKey, type MemoryValue } from "./inst";
import type { GameScene } from "./gamescene";
import { fetchNumber, getCards, getPlayers } from "./instdecoder";

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

type CallInfo = {
    params: MemoryValue[]
    return: (value?: MemoryValue) => void;
};

class RunningCallEffect extends RunningEffect {
    subRunning: RunningInstStream;
    private instExecutor;
    parentMemory;
    private returnFunction;

    constructor(effect: EffectType["Call"], context: RunningInstStream) {
        super();
        this.parentMemory = context.memory;
        this.instExecutor = context.instExecutor;
        this.returnFunction = (value?: MemoryValue) => {
            if(value && effect.saveTo) this.parentMemory.set(effect.saveTo, value);
        };

        const callInfo: CallInfo = {
            params: effect.params.map(key => {
                const value = this.parentMemory.get(key);
                if(value === undefined) throw `there was no param value at ${key}`;
                return value;
            }),
            return: this.returnFunction
        };
        this.subRunning = new RunningInstStream(this.instExecutor, effect.stream, callInfo);
    }

    progress(): boolean {
        while(true) {
            const result = this.subRunning.progress();
                switch(result) {
                case 1:
                    break;
                case 2:
                    return true;
                case undefined:
                    return false;
                default:
                    this.subRunning = result;
                    break;
            }
        }
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
                case "save_card":
                    const cardsToSave = getCards(effect.target, context.memory, this.board);
                    context.memory.set(effect.key, cardsToSave);
                    return false;
                case "save_player":
                    const players = getPlayers(effect.target, context.memory);
                    context.memory.set(effect.key, players);
                    return false;
                case "move": {
                    const cards = getCards(effect.target, context.memory, this.board);
                    for(const card of cards) {
                        if(effect.to) {
                            const player = effect.to.player !== undefined ? getPlayers(effect.to.player, context.memory).at(0) : undefined;
                            this.boardWindow.moveCard(card, { key: effect.to.key, player});
                        } else {
                            this.boardWindow.moveCard(card);
                        }
                    }
                    return new RunningMoveEffect(this.scene, cards);
                }
                case "flip":
                    const cards = getCards(effect.target, context.memory, this.board);
                    for(const card of cards) {
                        this.boardWindow.flipCard(card, effect.isFront);
                    }
                    return false;
                case "timeout":
                    return new RunningTimeoutEffect(this.scene, effect);
                case "call":
                    return new RunningCallEffect(effect, context);
            }
        } catch(e) {
            console.error(e);
        }
        return false;
    }
}

export type Memory = Map<MemoryKey, MemoryValue>;

class RunningInstStream {
    memory: Memory = new Map<MemoryKey, MemoryValue>();
    runningIndex = 0;
    runningEffect: RunningEffect | undefined;
    stream;
    instExecutor;
    callInfo;

    constructor(instExecutor: InstExecutor, stream: InstStream, callInfo?: CallInfo) {
        this.stream = stream;
        this.instExecutor = instExecutor;
        this.callInfo = callInfo;
        if(callInfo) this.getParams(callInfo);
    }

    getParams(callInfo: CallInfo) {
        const aliases = this.stream.paramAliases;
        callInfo.params.forEach((param, i) => {
            this.memory.set(`param${i}`, param);
            if(aliases && i < aliases.length) {
                this.memory.set(aliases[i], param);
            }
        });
    }

    /**
     * RunningInstStream ... completed current stream, next run this
     *
     * 1 ... still able to progress at this moment
     *
     * 2 ... unable to progress anymore at this moment
     *
     * undefined ... completed current stream, no more for now
     */
    progress(): 1 | 2 | RunningInstStream | undefined {
        if(this.runningIndex >= this.stream.body.length) return;
        const inst = this.stream.body[this.runningIndex];
        if(this.runningEffect || isEffect(inst)) {
            //@ts-ignore
            const stillRunning = this.runningEffect ? this.runningEffect.progress() : this.executeEffect(inst);
            if(stillRunning) {
                return 2;
            } else {
                this.runningEffect = undefined;
                this.runningIndex++;
                return 1;
            }
        } else {
            this.runningIndex++;
            return this.executeControl(inst);
        }
    }

    /** @return if the effect is still running */
    private executeEffect(next: Effect) {
        const runningEffect = this.instExecutor.executeEffect(next, this);
        if(!runningEffect) return false;
        this.runningEffect = runningEffect;
        return this.runningEffect.progress();
    }

    /** @return stream that the manager will run after this control */
    private executeControl(control: Control): RunningInstStream | undefined {
        switch(control.type) {
            case "jump":
                return new RunningInstStream(this.instExecutor, control.stream);
            case "return":
                if(this.callInfo) {
                    const returnValue = control.return ? this.memory.get(control.return) : undefined;
                    this.callInfo.return(returnValue);
                }
                return undefined;
            case "repeat":
                this.memory.set(control.counter, 0);
                return this;
            case "close":
                this.executeCloseControl(control);
                return this;
        }
    }
    private executeCloseControl(control: ControlType["Close"]): void {
        const result = this.findRepetitionBeginning(control);
        if(!result) {
            console.error("couldn't found repetition beginning");
            return;
        }
        const { beginning, beginningIndex } = result;
        const count = fetchNumber(control.counter, this.memory);
        if(count === undefined) {
            console.error("there was no initialized counter data");
            return;
        }
        const nextCount = count + 1;
        this.memory.set(control.counter, nextCount);
        if(nextCount < beginning.times) {
            this.runningIndex = beginningIndex + 1;
        }
    }

    private findRepetitionBeginning(close: ControlType["Close"]) {
        for(let i = this.stream.body.indexOf(close); i >= 0; i--) {
            const inst = this.stream.body[i];
            if(inst.type === "repeat" && inst.counter === close.counter) {
                return { beginning: inst, beginningIndex: i };
            }
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
        while(true) {
            if(!this.running) return true;
            const result = this.running.progress();
            switch(result) {
                case 1:
                    break;
                case 2:
                    return false;
                default:
                    this.running = result;
            }
        }
    }
}
