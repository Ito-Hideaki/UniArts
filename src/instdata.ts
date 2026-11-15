import type { InstStream } from "./inst";

const NULL_STREAM: InstStream = { body: [] };

export const commonStream: { [k: string]: InstStream } = {
    null: NULL_STREAM,
    "draw": {
        paramAliases: ["player"],
        body: [
            {
                type: "save_card",
                value: {
                    type: "top",
                    max: 1,
                    source: {
                        type: "pile",
                        pile: {
                            key: "deck",
                            player: "player"
                        }
                    }
                },
                key: "drawn"
            },
            { type: "flip", target: "drawn", isFront: 1 },
            { type: "move", target: "drawn", to: { key: "hands", player: "player" } },
            { type: "timeout", duration: 300 }
        ]
    }
};

export const systemStream: { [k: string]: InstStream } = {
    start: {
        body: [
            { type: "call", stream: "system.deal_hands", params: [] },
            { type: "loop" },
                { type: "save_num", value: 0, key: "r.current_player" },
                { type: "loop" },
                    { type: "call", stream: "system.play_from_hands", params: [] },
                    { type: "save_num", key: "r.current_player", value: { type: "+", v1: "r.current_player", v2: 1 }},
                    { type: "break", if: { type: "==", v1: "r.current_player", v2: 2 } },
                { type: "end_loop" },
            { type: "end_loop" },
        ]
    },
    deal_hands: {
        body: [
            { type: "save_num", value: 0, key: "pi" },
            { type: "loop" },
                { type: "save_num", value: 0, key: "i" },
                { type: "loop" },
                    { type: "save_num", key: "player", value: "pi" },
                    { type: "call", stream: "common.draw", params: ["player"] },

                    { type: "save_num", key: "i", value: { type: "+", v1: "i", v2: 1 } },
                    { type: "break", if: { type: "==", v1: "i", v2: 3 } },
                { type: "end_loop" },

                { type: "save_num", key: "pi", value: { type: "+", v1: "pi", v2: 1 } },
                { type: "break", if: { type: "==", v1: "pi", v2: 2 } },
            { type: "end_loop" },
        ]
    },
    play_from_hands: {
        body: [
            { type: "choose_card", saveTo: "picked", target: {
                type: "pile",
                pile: {
                    player: "r.current_player",
                    key: "hands"
                }
            } },
            { type: "move", target: "picked", to: { player: "r.current_player", key: "field" } }
        ]
    }
};