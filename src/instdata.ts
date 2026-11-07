import type { InstStream } from "./inst";

const NULL_STREAM: InstStream = { body: [] };

export const commonStream: { [k: string]: InstStream } = {
    null: NULL_STREAM,
    "draw": {
        paramAliases: ["draw_from"],
        body: [
            {
                type: "save_card",
                target: {
                    type: "top",
                    max: 1,
                    source: {
                        type: "pile",
                        pile: {
                            key: "deck",
                            player: "draw_from"
                        }
                    }
                },
                key: "drawn"
            },
            { type: "flip", target: "drawn", isFront: 1 },
            { type: "move", target: "drawn", to: { key: "hands", player: [0] } },
            { type: "timeout", duration: 300 }
        ]
    }
};

export const systemStream: { [k: string]: InstStream } = {
    deal_hands: NULL_STREAM
};
systemStream.start = {
        body: [
            { type: "jump", stream: systemStream.deal_hands }
        ]
};
Object.assign(systemStream.deal_hands, {
    body: [
        { type: "save_player", target: [0], key: "draw_from" },
        { type: "save_num", value: 0, key: "i" },
        { type: "loop" },
            { type: "call", stream: commonStream.draw, params: ["draw_from"] },
            { type: "save_num", key: "i", value: { type: "+", v1: "i", v2: 1 } },
            { type: "break", if: { type: "==", v1: "i", v2: 3 } },
        { type: "end_loop" }
    ]
} satisfies InstStream);