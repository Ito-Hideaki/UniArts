import type { Board } from "./board";
import type { Pile } from "./pile";

export type TriggerString = "onUse";
export interface CardInfo {
    id: string;
    name: string;
    stream: {
        [k in TriggerString]?: string;
    }
}

export type CardState = {
    isFront: boolean;
}

export type Card = {
    info: CardInfo;
    board: Board;
    pile?: Pile;
    state: CardState;
}