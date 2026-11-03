import type { Card } from "./card";

export class Pile {
    cards: Card[] = [];
    pID;
    constructor(pID: number) {
        this.pID = pID;
    }
}