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
            {
                type: "flip",
                target: "drawn",
                isFront: true
            },
            {
                type: "move",
                target: "drawn",
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