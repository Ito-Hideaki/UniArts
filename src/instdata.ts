import type { InstStream } from "./inst";

const NULL_STREAM: InstStream = { body: [] };

export const commonStream: { [k: string]: InstStream } = {
    null: NULL_STREAM,
    "draw": {
        paramAliases: ["player"],
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
    deal_hands: NULL_STREAM
};
systemStream.start = {
        body: [
            { type: "jump", stream: systemStream.deal_hands }
        ]
};
Object.assign(systemStream.deal_hands, {
    body: [
        { type: "save_num", value: 0, key: "pi" },
        { type: "loop" },
            { type: "save_num", value: 0, key: "i" },
            { type: "loop" },
                { type: "save_player", key: "player", target: ["pi"] },
                { type: "call", stream: commonStream.draw, params: ["player"] },

                { type: "save_num", key: "i", value: { type: "+", v1: "i", v2: 1 } },
                { type: "break", if: { type: "==", v1: "i", v2: 3 } },
            { type: "end_loop" },

            { type: "save_num", key: "pi", value: { type: "+", v1: "pi", v2: 1 } },
            { type: "break", if: { type: "==", v1: "pi", v2: 2 } },
        { type: "end_loop" }
    ]
} satisfies InstStream);