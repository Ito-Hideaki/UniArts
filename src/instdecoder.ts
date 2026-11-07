import type { Board } from "./abstracts/board";
import type { Card } from "./abstracts/card";
import type { BinaryExpressionType, CardEntry, MemoryKey, NumberEntry, PlayerEntry } from "./inst";
import type { Memory } from "./instexecutor";

function getCardsFromMemory(key: MemoryKey, memory: Memory): Card[] {
    const raw = memory.get(key);
    if (!Array.isArray(raw)) throw "value is not array";
    const filtered = raw.filter(value => typeof value === "object");
    if(filtered.length !== raw.length) throw "value is not object array";
    return filtered;
}

function getNumbersFromMemory(key: MemoryKey, memory: Memory): number[] {
    const raw = memory.get(key);
    if (!Array.isArray(raw)) throw "value is not array";
    const filtered = raw.filter(value => typeof value === "number");
    if(filtered.length !== raw.length) throw "value is not number array";
    return filtered;
}

function getNumberFromMemory(key: MemoryKey, memory: Memory): number {
    const raw = memory.get(key);
    if(typeof raw !== "number") throw "value is not number";
    return raw;
}

export const fetchCards = getCardsFromMemory;
export const fetchNumber = getNumberFromMemory;
export const fetchNumArray = getNumbersFromMemory;

export function getPlayers(entry: PlayerEntry, memory: Memory): number[] {
    if (Array.isArray(entry)) {
        return entry.map(numEntry => getNumber(numEntry, memory));
    } else if (typeof entry === "string") {
        return fetchNumArray(entry, memory);
    } else {
        return [getNumber(entry, memory)];
    }
}

export function getCards(entry: CardEntry, memory: Memory, board: Board): Card[] {
    if(typeof entry === "string") {
        return fetchCards(entry, memory);
    }
    const selector = entry;
    switch(selector.type) {
        case "pile":
            if(typeof selector.pile !== "string" && selector.pile.player !== undefined) {
                const player = getPlayers(selector.pile.player, memory).at(0);
                if(player === undefined) {
                    console.error("found no player to choose pile from");
                    return [];
                }
                return board.piles[player][selector.pile.key].cards;
            } else return [];
        case "top":
            const sourceCards = getCards(selector.source, memory, board);
            return sourceCards.slice(-selector.max);
    }
}

function dobinaryOperation(type: BinaryExpressionType, v1: number, v2: number): number {
    switch(type) {
        case "+":
            return v1 + v2;
        case "==":
            return v1 == v2 ? 1 : 0;
    }
}

export function getNumber(entry: NumberEntry, memory: Memory): number {
    if(typeof entry === "string") return fetchNumber(entry, memory);
    if(typeof entry === "number") return entry;
    switch(entry.type) {
        case "+":
        case "==":
            return dobinaryOperation(entry.type, getNumber(entry.v1, memory), getNumber(entry.v2, memory));
    }
}