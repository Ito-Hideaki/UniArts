import type { Card } from "./abstracts/card";

export type NumberEntry = number | MemoryKey;

export type PileSelector = {
    player: PlayerEntry;
    key: string;
};
export type PileEntry = PileSelector;

export type PlayerSelector = number | number[];
export type PlayerEntry = PlayerSelector | MemoryKey;

export type SelectorType = {
    Pile: {
        type: "pile";
        pile: PileEntry;
    },
    Top: {
        type: "top";
        source: CardEntry;
        max: NumberEntry;
    }
}

export type Selector = SelectorType[keyof SelectorType];
export type CardEntry = Selector | MemoryKey;

export type MemoryKey = string;
export type MemoryValue = Card[] | number[] | number;

export type EffectType = {
    Test: {
        type: "test";
        value: string;
    },
    Move: {
        type: "move";
        target: CardEntry;
        to?: PileEntry;
    },
    Flip: {
        type: "flip";
        target: CardEntry;
        isFront: boolean;
    },
    SaveCard: {
        type: "save_card";
        target: CardEntry;
        key: MemoryKey;
    },
    SavePlayer: {
        type: "save_player";
        target: PlayerEntry;
        key: MemoryKey;
    },
    Timeout: {
        type: "timeout";
        duration: NumberEntry;
    },
    Call: {
        type: "call";
        stream: InstStream;
        params: MemoryKey[];
        saveTo?: MemoryKey;
    }
}

export type Effect = EffectType[keyof EffectType]
export type ControlType = {
    Jump: {
        type: "jump";
        stream: InstStream;
    },
    Return: {
        type: "return";
        return?: MemoryKey;
    },
    Loop: {
        type: "loop";
    },
    EndLoop: {
        type: "end_loop";
    },
    Break: {
        type: "break";
        if?: NumberEntry;
    }
}
export const EFFECT_TYPES: EffectType[keyof EffectType]["type"][] = [
    "flip",
    "move",
    "save_card",
    "save_player",
    "test",
    "timeout",
    "call"
];
export type Control = ControlType[keyof ControlType];
export const CONTROL_TYPES: ControlType[keyof ControlType]["type"][] = [
    "jump",
    "return",
    "loop",
    "end_loop",
    "break"
];
export type Inst = Effect | Control;

export function isEffect(inst: Inst): inst is Effect {
    for(const type of EFFECT_TYPES) {
        if(type === inst.type) return true;
    }
    return false;
}
export function isControl(inst: Inst): inst is Control {
    for(const type of CONTROL_TYPES) {
        if(type === inst.type) return true;
    }
    return false;
}

export interface InstStream {
    paramAliases?: MemoryKey[];
    body: Inst[];
}