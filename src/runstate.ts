import type { Memory } from "./instdecoder";

export class RunState {
    map: Memory;
    constructor() {
        this.map = new Map();
    }


}