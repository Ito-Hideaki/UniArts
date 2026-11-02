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
        stream: InstStream;
    },
    Timeout: {
        type: "timeout";
        duration: number;
    }
}

export type Effect = EffectType[keyof EffectType]
export type ControlType = {
    Jump: {
        type: "jump";
        stream: InstStream;
    }
}
export type Control = ControlType[keyof ControlType];
export type Inst = Effect | Control;

export interface InstStream {
    body: Inst[];
}