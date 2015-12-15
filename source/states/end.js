import {NullCamera} from "../camera.js";
import {Color} from "../gfxcore.js";

export class EndState {
  constructor(game) {
    this.game = game;
    this.camera = new NullCamera();
    this.start = game.gametime.now;
    this.fadeColor = new Color(0, 0, 0, 0);
  }

  drawCentered(gtx, txt, size, y) {
    gtx.font = size + "px monospace";
    gtx.fillStyle = "white";
    let w = gtx.measureText(txt).width;
    gtx.drawText(txt, gtx.canvas.width/2-w/2, y);
  }
  
  render() {
    this.game.gfx.clearScreen(this.game.gfx.black);
    let w = this.game.gfx.white;
    let gtx = this.game.gfx.ctx;
    this.drawCentered(gtx, "This is the end!", 30, 100);
    this.drawCentered(gtx, "Thanks for playing my game!", 20, 140);
    this.drawCentered(gtx, "There were going to be more levels", 20, 250);
    this.drawCentered(gtx, "with more songs, but those didn't", 20, 275);
    this.drawCentered(gtx, "get finished in time. Sorry!", 20, 300);
    let t = this.game.gametime.now - this.start;
    let fade = t/4000;
    if(fade > 1) { fade = 1; }
    this.fadeColor.alpha = 1-fade;
    this.game.gfx.clearScreen(this.fadeColor);
  }
}
