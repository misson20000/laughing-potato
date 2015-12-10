import {Camera} from "../camera.js";

export class SoundTestState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
  }

  render() {
    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.clearScreen(this.game.gfx.black);
  }
}
