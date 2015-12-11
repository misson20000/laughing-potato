import * as wm from "../whether-manager/whether-manager.js";

import {Camera} from "../camera.js";
import {Color} from "../gfxcore.js";
import {Vector} from "../vector.js";

// let SKY_COLOR = new Color(128, 128, 255); // day time
let SKY_COLOR = new Color(16, 0, 32); // night time

class Snowflake {
  constructor(state) {
    this.speed = 40*(1+Math.random());
    this.centerX = Math.random()*state.camera.width-(state.camera.width/2);
    this.wave = {
        phase: Math.random()*2*Math.PI,
        period: Math.random()*1.0+3.0,
        amplitude: Math.random()*20.0
    };
    this.x = this.centerX;
    this.y = Math.random()*state.camera.height-(state.camera.height/2);
    this.r = 0;
    this.rs = Math.PI * (Math.random()+0.2);
    this.asset = state.assets.object.snowflake;
  }

  update() {
  }

  render(state, gfx) {
    let w = Math.sin(this.wave.phase+(state.game.gametime.now/1000.0/this.wave.period*2*Math.PI));
    this.x = w*this.wave.amplitude+this.centerX;
    this.y+= this.speed/1000.0 * state.game.gametime.delta;
    //this.r = w * Math.PI / 4;
    this.r+= this.rs/1000.0 * state.game.gametime.delta;
    if(this.y > state.camera.height/2) {
      this.y = -state.camera.height/2 - 8;
    }
    gfx.drawImage(this.asset, this.x, this.y, this.r);
  }
}

export class SnowState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
    this.game.gfx.lookThrough(this.camera);
    this.assets = game.assetManager.assets;
    this.entities = [];

    this.resize();
  }

  resize() {
    this.camera.scale = this.game.gfx.width/this.assets.object.snowhill.data.width;
    
    this.entities.length = 0;
    for(let i = 0; i < Math.floor(2000/Math.pow(this.camera.scale, 2)); i++) {
      this.entities.push(new Snowflake(this));
    }
  }
  
  render() {
    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.clearScreen(SKY_COLOR);

    this.game.gfx.drawImage(this.assets.object.moon, 70, -70);
    
    this.entities.forEach((ent) => {
      ent.update();
      ent.render(this, this.game.gfx);
    });
    
    this.game.gfx.drawImage(this.assets.object.snowhill, -(this.camera.width/2), -(this.camera.height*(3/4)));
  }
}
