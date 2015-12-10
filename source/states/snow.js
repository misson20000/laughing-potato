import * as wm from "../whether-manager/whether-manager.js";

import {Camera} from "../camera.js";
import {Color} from "../gfxcore.js";
import {Vector} from "../vector.js";

// let SKY_COLOR = new Color(128, 128, 255); // day time
let SKY_COLOR = new Color(16, 0, 32); // night time

export class SnowState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
    this.game.gfx.lookThrough(this.camera);
    this.assets = game.assetManager.assets;
    this.componentTypes = {
      physics: {
        main: wm.node(),
        position: wm.node(),
        velocity: wm.node()
      },
      position: wm.node(),
      image: wm.node(),
      snowflake: wm.node(),
    };
    this.entities = wm.node();

    this.resize();
  }

  resize() {
    this.componentTypes.snowflake.nodes().forEach((flake) => { flake.clear() });
    for(let i = 0; i < Math.floor(2000/9); i++) {
      let dat = {
        speed: 40*(1+Math.random()),
        x: Math.random()*this.camera.width-(this.camera.width/2),
        wave: {
          phase: Math.random()*2*Math.PI,
          period: Math.random()*1.0+3.0,
          amplitude: Math.random()*20.0
        }
      };
      let snowflake = this.componentTypes.snowflake.link(dat);
      snowflake.set(this.entities);
      snowflake.set(this.componentTypes.position, new Vector(dat.x, Math.random()*this.camera.height-(this.camera.height/2)));
      snowflake.set(this.componentTypes.image, {
        asset: this.assets.object.snowflake,
        position: snowflake.get(this.componentTypes.position)
      });
    }
  }
  
  render() {
    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.clearScreen(SKY_COLOR);

    this.game.gfx.drawImage(this.assets.object.moon, 70, -70);
    
    this.componentTypes.image.nodes().forEach((ent) => {
      let dat = ent.get(this.componentTypes.image);
      this.game.gfx.drawImage(dat.asset, Math.floor(dat.position.x), Math.floor(dat.position.y));
    });

    this.componentTypes.snowflake.nodes().forEach((flake) => {
      let pos = flake.get(this.componentTypes.position);
      let dat = flake.get(this.componentTypes.snowflake);
      pos.x = Math.sin(dat.wave.phase+(this.game.gametime.now/1000.0/dat.wave.period*2*Math.PI))*dat.wave.amplitude+dat.x;
      pos.y+= dat.speed/1000.0 * this.game.gametime.delta;
      if(pos.y > this.camera.height/2) {
        pos.y = -this.camera.height/2 - 8;
      }
    });
    
    this.game.gfx.drawImage(this.assets.object.snowhill, -(this.camera.width/2), -(this.camera.height*(3/4)));
  }
}
