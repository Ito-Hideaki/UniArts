import type { InstStream } from "./inst";

export const commonStream: { [k: string]: InstStream } = {
    "draw": {
        body: [
            {
                type: "save_as",
                target: {
                    type: "top",
                    max: 1,
                    source: {
                        type: "pile",
                        pile: "deck"
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
}