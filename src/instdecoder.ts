import type { Card } from "./abstracts/card";
import type { MemoryKey } from "./inst";
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

export const Decoder = {
    getCardsFromMemory,
    getNumberFromMemory,
    getNumbersFromMemory
} as const;