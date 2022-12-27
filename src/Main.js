import { CanvasDriver, Input, Engine, StageScaleMode, Black, MasterAudio } from "black-engine";
//import { GameSpine } from "./game-spine";
import { Game } from "./Game";
// import * as glMatrix from "./gl-matrix";

document.addEventListener('contextmenu', e => e.preventDefault());

const engine = new Engine('container', Game, CanvasDriver, [Input, MasterAudio]);

// Pause simulation when container loses focus
engine.pauseOnBlur = false;
engine.pauseOnHide = true;
engine.viewport.isTransparent = true;
engine.viewport.backgroundColor = 0x222222;
engine.start();
engine.stage.setSize(900, 500);
engine.stage.scaleMode = StageScaleMode.LETTERBOX;

