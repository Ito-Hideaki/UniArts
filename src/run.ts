import { Board } from "./abstracts/board";
import { BoardWindow } from "./abstracts/boardwindow";
import type { Pile } from "./abstracts/pile";
import type { GameInfo } from "./gameinfo";
import type { CardObject } from "./gameobjects/cardobject";
import type { PileObject } from "./gameobjects/pileobject";
import type { GameScene } from "./gamescene";
import { InstExecutor, InstStreamManager, type Memory } from "./instexecutor";

type PlayerPiles = { [k: string]: Pile };

export const Run = {
    addPileObject: function(scene: Phaser.Scene, run: Run, pile: PileObject) {
        scene.add.existing(pile);
        run.pileObjects.add(pile);
    },
    progress: function(run: Run) {
        const instStreamManager = run.get.instStreamManager();
        instStreamManager.progress();
    }
};
export interface Run {
    pileObjects: Set<PileObject>;
    cardObjects: Set<CardObject>;
    piles: PlayerPiles[];
    board: Board;
    boardWindow: BoardWindow;
    info: GameInfo;
    get: {
        instStreamManager: () => InstStreamManager
    };
    state: Memory;
    scene: Phaser.Scene;
}

export function startRun(scene: GameScene): Run {
    const getFrom: {
        instStreamManager?: InstStreamManager;
    } = {};
    const info: GameInfo = {
        playerNum: 2
    };
    const piles: PlayerPiles[] = new Array(info.playerNum).fill(0).map(() => { return {}; });
    const board = new Board(piles);
    const boardWindow = new BoardWindow(board);
    const state: Memory = new Map();
    state.set("current_player", 0);

    const run: Run = {
        info,
        pileObjects: new Set(),
        cardObjects: new Set(),
        piles,
        board,
        boardWindow,
        get: {
            instStreamManager: () => {
                if(!getFrom.instStreamManager) throw "getFrom.instStreamManager is not initialized";
                return getFrom.instStreamManager;
            }
        },
        state,
        scene
    };

    const instExecutor = new InstExecutor(run);
    getFrom.instStreamManager = new InstStreamManager(instExecutor);
    return run;
}