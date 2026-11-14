import type { EffectType } from "../inst";
import { getCards } from "../instdecoder";
import type { RunningInstStream } from "../instexecutor";
import type { Run } from "../run";

export function executeFlipEffect(run: Run, effect: EffectType["Flip"], context: RunningInstStream) {
    const cards = getCards(effect.target, context.fullMemory, run.board);
    for(const card of cards) {
        run.boardWindow.flipCard(card, Boolean(effect.isFront));
    }
}