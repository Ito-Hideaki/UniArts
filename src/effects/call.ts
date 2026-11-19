import { RunningEffect } from "./effect";
import { Run } from "../run";
import type { EffectType, InstStream, MemoryValue } from "../inst";
import { RunningInstStream, type CallInfo } from "../instexecutor";
import { FullMemory } from "../instdecoder";

class RunningCallEffect extends RunningEffect {
    subRunning: RunningInstStream;
    parentMemory;
    private returnFunction;
    private run;

    constructor(effect: EffectType["Call"], stream: InstStream, context: RunningInstStream, run: Run) {
        super();
        this.parentMemory = context.localMemory;
        this.run = run;
        const saveTo = effect.saveTo ? FullMemory.getKeyFromEntry(context.fullMemory, effect.saveTo) : undefined;
        this.returnFunction = (value?: MemoryValue) => {
            if(value && saveTo) this.parentMemory.set(saveTo, value);
        };

        const callInfo: CallInfo = {
            params: effect.params.map(key => {
                const value = this.parentMemory.get(key);
                if(value === undefined) throw `there was no param value at ${key}`;
                return value;
            }),
            return: this.returnFunction
        };
        this.subRunning = new RunningInstStream(this.run, stream, callInfo);
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

export function executeCallEffect(run: Run, effect: EffectType["Call"], context: RunningInstStream): RunningCallEffect | false {
    const streamKey = FullMemory.getKeyFromEntry(context.fullMemory, effect.stream);
    const stream = run.registeredStream.get(streamKey);
    if(stream) {
        return new RunningCallEffect(effect, stream, context, run);
    } else {
        console.error(`stream ${streamKey} was not found`);
        return false;
    }
}