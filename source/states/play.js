import * as wm from "../whether-manager/whether-manager.js";

import {Camera} from "../camera.js";
import {Color, Animator} from "../gfxcore.js";
import {Vector} from "../vector.js";

// let SKY_COLOR = new Color(128, 128, 255); // day time
let SKY_COLOR = new Color(16, 0, 32); // night time

export class PlayState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
    this.assets = game.assetManager.assets;
    this.player = {
      x: 48,
      y: 48,
      a: new Animator(this.assets.character.quote.sprite)
    };
    this.map = this.assets.map.test;
    this.bgm = game.sfx.playMusic(this.assets.music.vs_hero);
  }
  
  render() {
    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.clearScreen(SKY_COLOR);

    this.game.gfx.drawImage(this.assets.object.moon, 70, -70);
    this.map.data.drawMap(this.game.gfx);
    this.player.a.render(this.game.gfx, this.player.x, this.player.y);
    this.player.a.play("walk");
    this.player.a.run(this.game.gametime.delta);
  }
}
