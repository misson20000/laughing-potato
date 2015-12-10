import * as wm from "../whether-manager/whether-manager.js";

import {Camera} from "../camera.js";
import {Color} from "../gfxcore.js";
import {Vector} from "../vector.js";

// let SKY_COLOR = new Color(128, 128, 255); // day time
let SKY_COLOR = new Color(16, 0, 32); // night time

export class PlayState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
    this.assets = game.assetManager.assets;
    this.componentTypes = {
      physics: {
        main: wm.node(),
        position: wm.node(),
        velocity: wm.node()
      },
      position: wm.node(),
      image: wm.node()
    };
    this.entities = wm.node();

    this.game.sfx.playSound(this.assets.sfx.olrogue);
  }
  
  render() {
    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.clearScreen(SKY_COLOR);

    this.game.gfx.drawImage(this.assets.object.moon, 70, -70);
    
    this.componentTypes.image.nodes().forEach((ent) => {
      let dat = ent.get(this.componentTypes.image);
      this.game.gfx.drawImage(dat.asset, Math.floor(dat.position.x), Math.floor(dat.position.y));
    });
  }
}
