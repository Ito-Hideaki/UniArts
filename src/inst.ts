import type { Card } from "./abstracts/card";

type StringExpression = {
    type: "join",
    source: StringEntry[],
    seperator?: string
} | {
    type: "card_stream",
    card: CardEntry,
    stream: StringEntry
};
export type StringEntry = string | StringExpression;

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
        saveTo: StringEntry;
    },
    SaveCard: {
        type: "save_card";
        value: CardEntry;
        key: StringEntry;
    },
    SaveNumbers: {
        type: "save_numbers";
        value: NumbersEntry;
        key: StringEntry;
    },
    SaveNumber: {
        type: "save_num";
        value: NumberEntry;
        key: StringEntry;
    },
    Timeout: {
        type: "timeout";
        duration: NumberEntry;
    },
    Call: {
        type: "call";
        stream: StringEntry;
        params: MemoryKey[];
        saveTo?: StringEntry;
    }
}

export type Effect = EffectType[keyof EffectType]
export type ControlType = {
    Jump: {
        type: "jump";
        stream: StringEntry;
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