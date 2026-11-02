import type { Board } from "./board";
import type { Card } from "./card";

/** operations that are guaranteed to be executed safely or to throw error */
export class BoardWindow {
    board;
    constructor(board: Board) {
        this.board = board;
    }

    moveCard(card: Card, to?: string) {
        if(to && !this.board.piles[to]) throw "Invalid Operation: destination string was not valid";
        this.board.moveCard(card, to);
    }

    flipCard(card: Card, isFront: boolean) {
        card.state.isFront = isFront;
    }
}