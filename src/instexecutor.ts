import { executeCallEffect } from "./effects/call";
import { executeChooseCardEffect } from "./effects/choosecard";
import { RunningEffect } from "./effects/effect";
import { executeFlipEffect } from "./effects/flip";
import { executeMoveEffect } from "./effects/move";
import { executeTimeoutEffect } from "./effects/timeout";
import { isEffect, type Control, type Effect, type InstStream, type MemoryKey, type MemoryValue } from "./inst";
import { getCards, getNumber, getPlayers } from "./instdecoder";
import { type Memory, FullMemory } from "./instdecoder";
import type { Run } from "./run";

export type CallInfo = {
    params: MemoryValue[]
    return: (value?: MemoryValue) => void;
};

export class EffectExecutor {
    scene;
    run: Run;

    constructor(run: Run) {
        this.run = run;
        this.scene = run.scene;
    }

    executeEffect(effect: Effect, context: RunningInstStream): false | RunningEffect {
        const run = this.run;
        const fullMemory: FullMemory = { run: this.run.state, local: context.localMemory };

        try {
            switch(effect.type) {
                case "test":
                    return false;
                case "save_card":
                    const cardsToSave = getCards(effect.target, fullMemory, run.board);
                    FullMemory.set(fullMemory, effect.key, cardsToSave);
                    return false;
                case "save_player":
                    const players = getPlayers(effect.target, fullMemory);
                    FullMemory.set(fullMemory, effect.key, players);
                    return false;
                case "save_num":
                    FullMemory.set(fullMemory, effect.key, getNumber(effect.value, fullMemory));
                    return false;
                case "move": {
                    return executeMoveEffect(this.run, effect, context);
                }
                case "flip":
                    executeFlipEffect(this.run, effect, context);
                    return false;
                case "choose_card":
                    return executeChooseCardEffect(this.run, getCards(effect.target, fullMemory, this.run.board));
                case "timeout":
                    return executeTimeoutEffect(this.run, effect, context);
                case "call":
                    return executeCallEffect(this.run, effect, context);
            }
        } catch(e) {
            console.error(e);
        }
        return false;
    }
}

function findBeginningOfLoop(index: number, stream: InstStream) {
    let depth = 0;
    for(let i = index - 1; i >= 0; i--) {
        const inst = stream.body[i];
        switch(inst.type) {
            case "loop":
                if(depth === 0) {
                    return i;
                } else {
                    depth--;
                }
                break;
            case "end_loop":
                depth++;
                break;
        }
    }
    throw "unable to find the beginnning of the loop";
}

function findEndOfLoop(index: number, stream: InstStream) {
    let depth = 0;
    for(let i = index + 1; i < stream.body.length; i++) {
        const inst = stream.body[i];
        switch(inst.type) {
            case "loop":
                depth++;
                break;
            case "end_loop":
                if(depth === 0) {
                    return i;
                } else {
                    depth--;
                }
                break;
        }
    }
    throw "unable to find the end of the loop";
}

export class RunningInstStream {
    localMemory: Memory = new Map<MemoryKey, MemoryValue>();
    fullMemory: FullMemory;
    run;
    runningIndex = 0;
    runningEffect: RunningEffect | undefined;
    stream;
    callInfo;

    constructor(run: Run, stream: InstStream, callInfo?: CallInfo) {
        this.stream = stream;
        this.callInfo = callInfo;
        this.run = run;
        this.fullMemory = { local: this.localMemory, run: run.state };
        if(callInfo) this.getParams(callInfo);
    }

    getParams(callInfo: CallInfo) {
        const aliases = this.stream.paramAliases;
        callInfo.params.forEach((param, i) => {
            this.localMemory.set(`param${i}`, param);
            if(aliases && i < aliases.length) {
                this.localMemory.set(aliases[i], param);
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
            return this.executeControl(inst);
        }
    }

    /** @return if the effect is still running */
    private executeEffect(next: Effect) {
        const runningEffect = this.run.get.effectExecutor().executeEffect(next, this);
        if(!runningEffect) return false;
        this.runningEffect = runningEffect;
        return this.runningEffect.progress();
    }

    /** @return stream that the manager will run after this control */
    private executeControl(control: Control): RunningInstStream | undefined {
        switch(control.type) {
            case "jump":
                const stream = this.run.registeredStream.get(control.stream);
                if(stream) {
                    return new RunningInstStream(this.run, stream);
                } else {
                    console.error(`stream ${control.stream} was not found`);
                    return this;
                }
            case "return":
                if(this.callInfo) {
                    const returnValue = control.return ? this.localMemory.get(control.return) : undefined;
                    this.callInfo.return(returnValue);
                }
                return undefined;
            case "loop":
                this.runningIndex++;
                return this;
            case "end_loop":
                const beginningIndex = findBeginningOfLoop(this.runningIndex, this.stream);
                this.runningIndex = beginningIndex;
                return this;
            case "break":
                if (control.if !== undefined && !getNumber(control.if, this.fullMemory)) {
                    this.runningIndex++;
                } else {
                    const endIndex = findEndOfLoop(this.runningIndex, this.stream);
                    this.runningIndex = endIndex + 1;
                }
                return this;

        }
    }
}

export class InstStreamManager {
    running: RunningInstStream | undefined;
    private run;

    constructor(run: Run) {
        this.run = run;
    }

    executeStream(stream: InstStream) {
        if(this.running) throw "not finished previous stream yet";
        this.running = new RunningInstStream(this.run, stream);
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
