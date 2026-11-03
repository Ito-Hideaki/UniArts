export type PileSelector = string | {
    player? : number;
    key: string;
};

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
export type MemoryValue = Card[];

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
    SaveAs: {
        type: "save";
        target: Selector;
        key: MemoryKey;
    },
    For: {
        type: "for";
        repeat: number;
        stream: InstStream;
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
    }
}
export const EFFECT_TYPES: EffectType[keyof EffectType]["type"][] = [
    "flip",
    "for",
    "move",
    "save",
    "test",
    "timeout",
    "call"
];
export type Control = ControlType[keyof ControlType];
export const CONTROL_TYPES: ControlType[keyof ControlType]["type"][] = [
    "jump"
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
    body: Inst[];
}