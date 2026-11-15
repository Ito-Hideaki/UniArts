import type { CardInfo } from "../abstracts/card";
import type { InstStream } from "../inst";


interface CardData {
    info: CardInfo;
    stream: { [k: string] : InstStream }
}

export const CARD_DATA: { [k: string]: CardData } = {
    "sample": {
        info: {
            id: "sample",
            name: "サンプル",
            stream: {
                onUse: "sample_onUse"
            }
        },
        stream: {
            onUse: {
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
                                    player: "r.current_player"
                                }
                            }
                        },
                        key: "card"
                    },
                    { type: "flip", target: "card", isFront: 1 },
                    { type: "move", target: "card", to: { key: "discarded", player: "r.current_player" } },
                ]
            }
        }
    }
};