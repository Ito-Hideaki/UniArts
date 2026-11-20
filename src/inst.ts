import type { Card } from "./abstracts/card";

export type StringObject = {
    type: "str";
    str: string;
};

export type MemoryEntry = MemoryKey | {
    type: "nest";
    keys: (StringObject | NumberEntry)[];
};

export type StreamEntry = MemoryEntry | {
    type: "card_stream";
    card: CardEntry;
    stream: string;
};

export type BinaryExpressionType = "+" | "==";
type BinaryExpression = {
    type: BinaryExpressionType;
    v1: NumberEntry;
    v2: NumberEntry;
};
type Expression = BinaryExpression;
export type NumberEntry = number | MemoryKey | Expression;
export type NumbersEntry = NumberEntry[] | MemoryKey | {
    type: "at";
    source: NumbersEntry;
    index: NumberEntry;
};

export type PileSelector = {
    player: NumberEntry;
    key: string;
};
export type PileEntry = PileSelector;

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
        isFront: NumberEntry;
    },
    ChooseCard: {
        type: "choose_card";
        target: CardEntry;
        max?: NumberEntry;
        saveTo: MemoryEntry;
    },
    SaveCard: {
        type: "save_card";
        value: CardEntry;
        key: MemoryEntry;
    },
    SaveNumbers: {
        type: "save_numbers";
        value: NumbersEntry;
        key: MemoryEntry;
    },
    SaveNumber: {
        type: "save_num";
        value: NumberEntry;
        key: MemoryEntry;
    },
    Timeout: {
        type: "timeout";
        duration: NumberEntry;
    },
    Call: {
        type: "call";
        stream: StreamEntry;
        params: MemoryKey[];
        saveTo?: MemoryEntry;
    }
}

export type Effect = EffectType[keyof EffectType]
export type ControlType = {
    Jump: {
        type: "jump";
        stream: StreamEntry;
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
    "choose_card",
    "save_card",
    "save_numbers",
    "save_num",
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