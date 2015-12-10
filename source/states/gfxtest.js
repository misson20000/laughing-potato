import {Camera} from "..//camera.js";

export class GFXTestState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
  }

  render() {    
    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.fillRect({x: -100, y:  10, w: 200, h: 10}, this.game.gfx.blue);
    this.game.gfx.fillRect({x: -100, y: -50, w:  10, h: 60}, this.game.gfx.green);
  }
}
