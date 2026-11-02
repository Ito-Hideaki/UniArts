import type { Card } from "./abstracts/card";

export type SelectorType = {
    Pile: {
        type: "pile";
        pile: string;
    },
    Top: {
        type: "top";
        source: Selector;
        max: number;
    },
    Load: {
        type: "load";
        key: string | number;
    }
}

export type Selector = SelectorType[keyof SelectorType];

export type EffectType = {
    Test: {
        type: "test";
        value: string;
    },
    Move: {
        type: "move";
        target: Selector;
        to?: string;
    },
    Flip: {
        type: "flip";
        target: Selector;
        isFront: boolean;
    },
    SaveAs: {
        type: "save_as";
        target: Selector;
        key: string | number;
    },
    For: {
        type: "for";
        repeat: number;
        stream: EffectStream;
    },
    Timeout: {
        type: "timeout";
        duration: number;
    }
}

export type Effect = EffectType[keyof EffectType]

export interface EffectStream {
    body: Effect[];
}