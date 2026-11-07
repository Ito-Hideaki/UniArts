import type { Card, CardInfo, CardState } from "./card";
import type { Pile } from "./pile";

export type CardMoveEvent = {
    card: Card;
    from?: Pile;
    to?: Pile;
}
type CardMoveListener = (event: CardMoveEvent) => void;

class BoardEventEmitter {
    private cardMoveListeners = new Map<Card, Set<CardMoveListener>>();

    onCardMove(card: Card, listener: CardMoveListener) {
        let listeners = this.cardMoveListeners.get(card);

        if(!listeners) {
            listeners = new Set();
            this.cardMoveListeners.set(card, listeners);
        }

        listeners.add(listener);
    }

    offCardMove(card: Card, listener: CardMoveListener) {
        const listeners = this.cardMoveListeners.get(card);
        if(!listeners) return;

        listeners.delete(listener);

        if(listeners.size === 0) this.cardMoveListeners.delete(card);
    }

    emitCardMove(event: CardMoveEvent) {
        const listeners = this.cardMoveListeners.get(event.card);
        if(!listeners) return;

        listeners.forEach(listener => listener(event));
    }
}

export class Board {

    cards: Set<Card> = new Set();
    piles;
    private event;

    constructor(piles: { [k: string]: Pile }[] = []) {
        this.piles = piles;
        this.event = new BoardEventEmitter();
    }

    onCardMove(card: Card, listener: CardMoveListener) {
        this.event.onCardMove(card, listener);
    }

    offCardMove(card: Card, listener: CardMoveListener) {
        this.event.offCardMove(card, listener);
    }

    createCard(info: CardInfo, state: CardState) {
        const card: Card = { info, board: this, state };
        this.cards.add(card);

        return card;
    }

    removeCard(card: Card) {
        this.cards.delete(card);
        return card;
    }

    getPile(key: string, player: number): Pile | undefined {
        return this.piles[player] && this.piles[player][key];
    }

    moveCard(card: Card, to?: { key: string, player?: number}) {
        const from = card.pile;
        if(from) {
            const index = from.cards.indexOf(card);
            if(index !== -1) from.cards.splice(index, 1);
        }
        const targetPlayer = to?.player ?? from?.pID;
        const dest = (to !== undefined && targetPlayer !== undefined && this.getPile(to.key, targetPlayer)) || undefined;
        if(dest && !dest.cards.includes(card)) dest.cards.push(card);
        card.pile = dest;

        this.event.emitCardMove({ card, from, to: dest });
    }
}