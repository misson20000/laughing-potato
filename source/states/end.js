import {NullCamera} from "../camera.js";
import {Color} from "../gfxcore.js";

export class EndState {
  constructor(game) {
    this.game = game;
    this.camera = new NullCamera();
    this.start = game.gametime.now;
    this.fadeColor = new Color(0, 0, 0, 0);
    this.bgm = game.sfx.playMusic(this.game.assetManager.assets.music.orig);
  }

  render() {
    this.game.gfx.clearScreen(this.game.gfx.black);
    let w = this.game.gfx.white;
    this.game.gfx.drawText("This is the end. That's all I got done in time!", 12, 24, w);
    this.game.gfx.drawText("Thanks for playing my game!", 12, 36, w);
    this.game.gfx.drawText("This was going to be the background music, but I didn't think it fit with the game", 24, 48, w);
    let t = this.game.gametime.now - this.start;
    let fade = t/2;
    if(fade > 1) { fade = 1; }
    this.bgm.gain.gain.value = fade;
    this.fadeColor.alpha = 1-fade;
    this.game.gfx.clearScreen(this.fadeColor);
  }
}
