import type { Board } from "./board";
import type { Card } from "./card";

/** operations that are guaranteed to be executed safely or to throw error */
export class BoardWindow {
    board;
    constructor(board: Board) {
        this.board = board;
    }

    moveCard(card: Card, to?: {key: string, player?: number}) {
        this.board.moveCard(card, to);
    }

    flipCard(card: Card, isFront: boolean) {
        card.state.isFront = isFront;
    }
}