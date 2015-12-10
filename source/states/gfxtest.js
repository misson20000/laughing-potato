import {Camera, NullCamera} from "../camera.js";

export class GFXTestState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
    this.hud = new NullCamera();
    this.fps = [];
  }

  render() {
    this.game.gfx.lookThrough(this.hud);
    this.fps.push(1000.0/this.game.gametime.delta);
    if(this.fps.length > 300) {
      this.fps.shift();
    }
    this.game.gfx.drawText("FPS:", 0, 12, this.game.gfx.white);
    for(let i = 0; i < this.fps.length; i++) {
      this.game.gfx.fillRect(i, 212-(this.fps[i]*200/60), 1, this.fps[i]*200/60, this.game.gfx.red);
    }
    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.fillRect(-100,  10, 200, 10, this.game.gfx.blue);
    this.game.gfx.fillRect(-100, -50,  10, 60, this.game.gfx.green);
    this.camera.rotate+= this.game.gametime.delta/1000.0;
    this.camera.scale = Math.sin(this.game.gametime.now/1000.0)+2.0;
  }
}
