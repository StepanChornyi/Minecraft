import { CanvasDriver, Input, Engine, StageScaleMode } from "black-engine";
//import { GameSpine } from "./game-spine";
import { Game } from "./game";
// import * as glMatrix from "./gl-matrix";

document.addEventListener('contextmenu', e => e.preventDefault());

const engine = new Engine('container', Game, CanvasDriver, [Input]);

// Pause simulation when container loses focus
engine.pauseOnBlur = false;
engine.pauseOnHide = true;
engine.viewport.isTransparent = true;
engine.viewport.backgroundColor = 0x222222;
engine.start();
engine.stage.setSize(900, 500);
engine.stage.scaleMode = StageScaleMode.LETTERBOX;

// Wroom, wroom!
engine.start();

// Set default stage size
engine.stage.setSize(900, 500);

// Makes stage always centered
engine.stage.scaleMode = StageScaleMode.LETTERBOX;

