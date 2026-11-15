import type { Board } from "./abstracts/board";
import type { Card } from "./abstracts/card";
import type { BinaryExpressionType, CardEntry, MemoryKey, MemoryValue, NumberEntry, NumbersEntry } from "./inst";

export type Memory = Map<MemoryKey, MemoryValue>;
export type FullMemory = {
    local: Memory;
    run: Memory;
};
export const FullMemory = {
    get: function(memory: FullMemory, key: MemoryKey) {
        if(key.slice(0, 2) === "r.") {
            return memory.run.get(key.slice(2));
        } else {
            return memory.local.get(key);
        }
    },
    set: function(memory: FullMemory, key: MemoryKey, value: MemoryValue) {
        if(key.slice(0, 2) === "r.") {
            return memory.run.set(key.slice(2), value);
        } else {
            return memory.local.set(key, value);
        }
    }
};

export function isMemoryCards(raw: MemoryValue | undefined): Card[] {
    if (!Array.isArray(raw)) throw "value is not array";
    const filtered = raw.filter(value => typeof value === "object");
    if(filtered.length !== raw.length) throw "value is not object array";
    return filtered;
};

export function isMemoryNumArray(raw: MemoryValue | undefined): number[] {
    if (!Array.isArray(raw)) throw "value is not array";
    const filtered = raw.filter(value => typeof value === "number");
    if(filtered.length !== raw.length) throw "value is not number array";
    return filtered;
}

export function isMemoryNumber(raw: MemoryValue | undefined): number {
    if(typeof raw !== "number") throw "value is not number";
    return raw;
}

function getCardsFromMemory(key: MemoryKey, memory: FullMemory): Card[] {
    const raw = FullMemory.get(memory, key);
    return isMemoryCards(raw);
}

function getNumbersFromMemory(key: MemoryKey, memory: FullMemory): number[] {
    const raw = FullMemory.get(memory, key);
    return isMemoryNumArray(raw);

}

function getNumberFromMemory(key: MemoryKey, memory: FullMemory): number {
    const raw = FullMemory.get(memory, key);
    return isMemoryNumber(raw);
}

export const fetchCards = getCardsFromMemory;
export const fetchNumber = getNumberFromMemory;
export const fetchNumArray = getNumbersFromMemory;

export function getNumArray(entry: NumbersEntry, memory: FullMemory): number[] {
    if (typeof entry === "string") {
        return fetchNumArray(entry, memory);
    } else if(Array.isArray(entry)) {
        return entry.map(numEntry => getNumber(numEntry, memory));
    } else {
        switch(entry.type) {
            case "at":
                const source = getNumArray(entry.source, memory);
                const index = getNumber(entry.index, memory);
                const result = source.at(index);
                if(result === undefined) throw "index is not valid";
                return [result];
        }
    }
}

export function getCards(entry: CardEntry, memory: FullMemory, board: Board): Card[] {
    if(typeof entry === "string") {
        return fetchCards(entry, memory);
    }
    const selector = entry;
    switch(selector.type) {
        case "pile":
            if(typeof selector.pile !== "string" && selector.pile.player !== undefined) {
                const player = getNumber(selector.pile.player, memory);
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

export function getNumber(entry: NumberEntry, memory: FullMemory): number {
    if(typeof entry === "string") return fetchNumber(entry, memory);
    if(typeof entry === "number") return entry;
    switch(entry.type) {
        case "+":
        case "==":
            return dobinaryOperation(entry.type, getNumber(entry.v1, memory), getNumber(entry.v2, memory));
    }
}