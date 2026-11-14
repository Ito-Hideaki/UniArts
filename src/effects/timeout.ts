import { RunningEffect } from "./effect";
import { Run } from "../run";
import type { EffectType } from "../inst";
import { RunningInstStream } from "../instexecutor";
import { getNumber } from "../instdecoder";

class RunningTimeoutEffect extends RunningEffect {
    expired = false;
    constructor(run: Run, duration: number) {
        super();
        run.scene.time.delayedCall(duration, () => {
            this.expired = true;
        });
    }

    progress(): boolean {
        return !this.expired;
    }
}

export function executeTimeoutEffect(run: Run, effect: EffectType["Timeout"], context: RunningInstStream): RunningTimeoutEffect | false {
    const duration = getNumber(effect.duration, context.fullMemory);
    return new RunningTimeoutEffect(run, duration);
}