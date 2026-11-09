import type { Memory } from "./instexecutor";

export class RunState {
    map: Memory;
    constructor() {
        this.map = new Map();
    }


}