import { RunningEffect } from "./effect";
import { Run } from "../run";
import type { EffectType, InstStream, MemoryValue } from "../inst";
import { RunningInstStream, type CallInfo } from "../instexecutor";

class RunningCallEffect extends RunningEffect {
    subRunning: RunningInstStream;
    private effectExecutor;
    parentMemory;
    private returnFunction;
    private run;

    constructor(effect: EffectType["Call"], stream: InstStream, context: RunningInstStream, run: Run) {
        super();
        this.parentMemory = context.localMemory;
        this.effectExecutor = context.effectExecutor;
        this.run = run;
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
        this.subRunning = new RunningInstStream(this.run, this.effectExecutor, stream, callInfo);
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
    const stream = run.registeredStream.get(effect.stream);
    if(stream) {
        return new RunningCallEffect(effect, stream, context, run);
    } else {
        console.error(`stream ${effect.stream} was not found`);
        return false;
    }
}