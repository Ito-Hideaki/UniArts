import type { Card } from "./abstracts/card";

export type PileSelector = string | {
    player? : PlayerSelector;
    key: string;
};

export type PlayerSelector = number | number[] | {
    type: "load",
    key: MemoryKey
}

export type SelectorType = {
    Pile: {
        type: "pile";
        pile: PileSelector;
    },
    Top: {
        type: "top";
        source: Selector;
        max: number;
    },
    Load: {
        type: "load";
        key: MemoryKey;
    }
}

export type Selector = SelectorType[keyof SelectorType];

export type MemoryKey = number | string;
export type MemoryValue = Card[] | number[];

export type EffectType = {
    Test: {
        type: "test";
        value: string;
    },
    Move: {
        type: "move";
        target: Selector;
        to?: PileSelector;
    },
    Flip: {
        type: "flip";
        target: Selector;
        isFront: boolean;
    },
    SaveCard: {
        type: "save_card";
        target: Selector;
        key: MemoryKey;
    },
    SavePlayer: {
        type: "save_player";
        target: PlayerSelector;
        key: MemoryKey;
    },
    Timeout: {
        type: "timeout";
        duration: number;
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
    Repeat: {
        type: "repeat";
        counter: MemoryKey;
        times: number;
    },
    Close: {
        type: "close";
        counter: MemoryKey;
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
    "repeat",
    "close"
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