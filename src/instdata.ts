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
                            player: {
                                type: "load",
                                key: "draw_from"
                            }
                        }
                    }
                },
                key: 0
            },
            {
                type: "flip",
                target: {
                    type: "load",
                    key: 0
                },
                isFront: true
            },
            {
                type: "move",
                target: {
                    type: "load",
                    key: 0
                },
                to: "hands"
            },
            {
                type: "timeout",
                duration: 300
            }
        ]
    }
};

export const systemStream: { [k: string]: InstStream } = {
    deal_hands: NULL_STREAM
};
systemStream.start = {
        body: [
            {
                type: "jump",
                stream: systemStream.deal_hands
            }
        ]
};
Object.assign(systemStream.deal_hands, {
    body: [
        {
            type: "save_player",
            target: 0,
            key: "draw_from"
        },
        {
            type: "repeat",
            counter: "i",
            times: 3
        },
        {
            type: "call",
            stream: commonStream.draw,
            params: ["draw_from"]
        },
        {
            type: "close",
            counter: "i"
        }
    ]
} satisfies InstStream);