import {Camera, NullCamera} from "../camera.js";
import {Animator} from "../gfxcore.js";

export class GFXTestState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
    this.camera.centerOnPoint(200, 200);
    this.hud = new NullCamera();
    this.fps = [];
    this.assets = game.assetManager.assets;
    this.quote = {
      x: 48,
      y: 48,
      a: new Animator(this.assets.character.quote.sprite)
    };
    this.doTrial = true;
  }

  render() {

    /* FPS Meter
    this.game.gfx.lookThrough(this.hud);
    this.fps.push(1000.0/this.game.gametime.delta);
    if(this.fps.length >= 300) {
      this.fps.shift();
    }
    this.game.gfx.drawText("FPS:", 0, 12, this.game.gfx.white);
    for(let i = 0; i < this.fps.length; i++) {
      this.game.gfx.fillRect(i, 212-(this.fps[i]*200/60), 1, this.fps[i]*200/60, this.game.gfx.red);
    }
    for(let fps = 0; fps <= 60; fps+= 10) {
      this.game.gfx.fillRect(0, 212-(fps*200/60), 305, 1, this.game.gfx.white);
      this.game.gfx.drawText(fps, 300, 212-(fps*200/60), this.game.gfx.white);
    }*/

    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.fillRect(-100,  10, 200, 10, this.game.gfx.blue);
    this.game.gfx.fillRect(-100, -50,  10, 60, this.game.gfx.green);
    this.camera.rotate = Math.sin(this.game.gametime.now/2000.0)/3.0;
    this.camera.scale = Math.sin(this.game.gametime.now/1000.0)+2.0;

    this.assets.map.test.data.drawMap(this.game.gfx);
    
    this.quote.a.render(this.game.gfx, this.quote.x, this.quote.y);
    this.quote.a.play("walk");
    this.quote.a.run(this.game.gametime.delta);
  }
}
