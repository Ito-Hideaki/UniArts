import type { Board } from "./board";
import type { Pile } from "./pile";

export type CardInfo = {
    name: string;
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