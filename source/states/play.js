import * as wm from "../whether-manager/whether-manager.js";

import {Camera} from "../camera.js";
import {Color, Animator} from "../gfxcore.js";
import {Vector} from "../vector.js";
import {EndState} from "./end.js";


// let SKY_COLOR = new Color(128, 128, 255); // day time
let SKY_COLOR = new Color(16, 0, 32); // night time

let toRad = (deg) => {
  return (deg/180.0)*Math.PI;
}

let toDeg = (rad) => {
  return (rad/Math.PI)*180.0;
}

let BPM = 160;
let BEAT_DISTANCE = 60;

class Arc {
  constructor(beat, b, e, s=0, t=0) {
    this.b = b;
    this.e = e;
    this.beat = beat;
    this.s = s;
    this.t = t * BEAT_DISTANCE || 10; //thickness
    this.scored = false;
  }

  draw(ctx, beat, beat0Radius) {
    if(beat0Radius+((beat-this.beat)*BEAT_DISTANCE)-this.t > 0) {
      ctx.beginPath();
      
      ctx.arc(0, 0, beat0Radius+((beat-this.beat)*BEAT_DISTANCE), toRad(90+this.b), toRad(90+this.e), false);
      ctx.arc(0, 0, beat0Radius+((beat-this.beat)*BEAT_DISTANCE)-this.t, toRad(90+this.e), toRad(90+this.b), true);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
  }

  inRange(beat) {
    let rd = (beat-this.beat)*BEAT_DISTANCE;
    return (rd <= this.t && rd >= 0);
  }
  
  hit(p, sz, r) {
    let ang = 2;
    return !(this.e < p-ang || this.b > p+ang);
  }
  
  update(time) {
    this.b+= this.s*time;
    this.e+= this.s*time;
    if(this.b >= 180 && this.e >= 180) {
      this.b-= 360;
      this.e-= 360;
    }
  }
}

class Message {
  constructor(startbeat, length, msg, yoff=0) {
    this.s = startbeat - 1;
    this.l = length;
    this.m = msg;
    this.y = yoff;
  }

  draw(gfx, beat) {
    if(this.s - beat < 0 && beat - this.s <= this.l) {
      if(beat - this.s > 1) {
        gfx.ctx.globalAlpha = 1.0;
      } else {
        gfx.ctx.globalAlpha = (beat - this.s)/1;
      }
      gfx.ctx.font = "30px monospace";
      gfx.ctx.save();
      gfx.ctx.resetTransform();
      let off = Math.sin(beat*Math.PI)*20;
      gfx.ctx.fillStyle = "black";
      gfx.ctx.fillText(this.m, 51 + off, 71 + off + this.y);
      gfx.ctx.fillStyle = "white";
      gfx.ctx.fillText(this.m, 50 + off, 70 + off + this.y);
      gfx.ctx.restore();
      gfx.ctx.globalAlpha = 1;
    }
  }
}

export class PlayState {
  constructor(game) {
    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
    this.assets = game.assetManager.assets;
    //this.player = {
    //  x: 48,
    //  y: 48,
    //  a: new Animator(this.assets.character.quote.sprite)
    //};
    this.playerAngle = 0;
    this.playerAngleTarget = 0;
    this.slowTimer = 0;
    this.slowActivateTimer = 0;
    this.input = game.input;
    
    this.arcs = [];

    this.messages = [];
    
    this.messages.push(new Message(2, 12, "AVOID RINGS"));
    
    this.arcs.push(new Arc(10, -90, -5));
    this.arcs.push(new Arc(10, 5, 90));
    this.arcs.push(new Arc(12, -90, -5));
    this.arcs.push(new Arc(12, 5, 90));

    this.messages.push(new Message(14, 12, "USE <LEFT> AND <RIGHT>"));
    this.messages.push(new Message(14, 12, "   (OR <A> AND <D> IF YOU PREFER)", 32));
    this.arcs.push(new Arc(26, -90, -15));
    this.arcs.push(new Arc(26, -5, 90));
    this.arcs.push(new Arc(28, -90, -15));
    this.arcs.push(new Arc(28, -5, 90));

    this.messages.push(new Message(32, 8, "LEVEL 1"));
    
    let b = 32;
    
    this.arcs.push(new Arc(b, -90, -20));
    this.arcs.push(new Arc(b, -10, 90));
    b+= 4;
    
    this.arcs.push(new Arc(b, -90, -5));
    this.arcs.push(new Arc(b, 5, 90));
    b+= 4;
    
    this.arcs.push(new Arc(b, -90, 10));
    this.arcs.push(new Arc(b, 20, 90));
    b+= 3;
    
    this.arcs.push(new Arc(b, -90, -7.5));
    this.arcs.push(new Arc(b, 7.5, 90));
    b+= 3;
    
    this.arcs.push(new Arc(b, -90, -15));
    this.arcs.push(new Arc(b, -5, 5));
    this.arcs.push(new Arc(b, 15, 90));
    b+= 2;
    
    this.arcs.push(new Arc(b, -90, -25));
    this.arcs.push(new Arc(b, -15, 15));
    this.arcs.push(new Arc(b, 25, 90));
    b+= 4;
    
    this.arcs.push(new Arc(b, -90, -5));
    this.arcs.push(new Arc(b, 5, 90));
    b+= 4;

    let hole = 0;
    this.arcs.push(new Arc(b, -90, hole-5));
    this.arcs.push(new Arc(b, hole+5, 90));
    b+= 1; hole-= 5;
    this.arcs.push(new Arc(b, -90, hole-5));
    this.arcs.push(new Arc(b, hole+5, 90));
    b+= 1; hole+= 5;
    this.arcs.push(new Arc(b, -90, hole-5));
    this.arcs.push(new Arc(b, hole+5, 90));
    b+= 1; hole+= 5;
    this.arcs.push(new Arc(b, -90, hole-5));
    this.arcs.push(new Arc(b, hole+5, 90));
    b+= 1; hole-= 5;
    this.arcs.push(new Arc(b, -90, hole-5));
    this.arcs.push(new Arc(b, hole+5, 90));
    b+= 4; hole = -15;
    this.arcs.push(new Arc(b, -90, hole-5));
    this.arcs.push(new Arc(b, hole+5, 90));
    b+= 8; hole = 15;
    this.arcs.push(new Arc(b, -90, hole-5));
    this.arcs.push(new Arc(b, hole+5, 90));
    b+= 4;
    for(let i = 0; i < 360; i+= 20) {
      this.arcs.push(new Arc(b, i, i+10, 10));
    }
    b+= 2;
    for(let i = 0; i < 360; i+= 20) {
      this.arcs.push(new Arc(b, i, i+10, 10));
    }
    b+= 2;
    for(let j = 0; j < 12; j++) {
      for(let i = 0; i < 360; i+= 40) {
        this.arcs.push(new Arc(b, i, i+10, 30-(j*2)));
      }
      b++;
    }
    // checkpoint (96)
    b = 104; // end bit
    hole = 0; this.arcAroundHole(b, hole, 5); b+= 2;
    hole = 5; this.arcAroundHole(b, hole, 5); b+= 2;
    hole = 10; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 5; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 0; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = -5; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = -10; this.arcAroundHole(b, hole, 5); b+= 0.33333;
    hole = -12.5; this.arcAroundHole(b, hole, 5); b+= 0.33333;
    hole = -15; this.arcAroundHole(b, hole, 5); b+= 0.33333;
    hole = -17.5; this.arcAroundHole(b, hole, 5); b+= 1;
    b = 116; // post-triplets
    hole = 10; this.arcAroundHole(b, hole, 5); b+= 2;
    hole = -10; this.arcAroundHole(b, hole, 5); b+= 2;

    // more arpeggios
    hole = 10; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 15; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 5; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 10; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 15; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 20; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 10; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = 0; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = -5; this.arcAroundHole(b, hole, 5); b+= 1;
    // more triplets
    hole = -10; this.arcAroundHole(b, hole, 5); b+= 0.33333;
    hole = -12.5; this.arcAroundHole(b, hole, 5); b+= 0.33333;
    hole = -15; this.arcAroundHole(b, hole, 5); b+= 0.33333;

    hole = -17.5; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = -20; this.arcAroundHole(b, hole, 5); b+= 1;
    hole = -15; this.arcAroundHole(b, hole, 5); b+= 2;
    hole = 0; this.arcAroundHole(b, hole, 5);

    this.end = 140;
    
    this.lineInterval = 5;
    this.bgm = game.sfx.playMusic(this.assets.music.bgm, 1.0, false);
    this.bgm.gain.gain.value = 0.0;
    this.game.gametime.now = 0;
    this.fadeColor = new Color(0, 0, 0, 0);
    
    this.timeTarget = 1.0;
    this.synced = false;
    this.checkpoint = 0;
    this.checkpointNo = 0;
    this.score = this.scoreAtCheckpoint = 0;
  }

/*  setSlow(v) {
    let factor = 1; // 0: slow, 1: fast
    if(v < 1) {
      if(0 >= v) {
        factor = 1.0;
      } else {
        factor = Math.pow((v-1), 2);
      }
    }
    if(1 <= v && v < 2) {
      factor = 0.0;
    }
    if(2 <= v) {
      if(v < 3) {
        factor = Math.pow((v-2), 2);
      } else {
        factor = 1.0;
      }
    }

    this.game.gametime.factor = 0.5;

    console.log("slow factor: " + factor);
    
    if(factor > 0.5) {
      if(this.bgmMode == "slow") {
        this.syncBgm();
        this.bgmMode = "fast";
      }
      this.bgm.aud.playbackRate = 0.5+(factor/2);
      this.bgm.gain.gain.value = 1.0;
      this.bgmSlow.gain.gain.value = 0.0;
    }
    if(factor < 0.5) {
      if(this.bgmMode == "fast") {
        this.syncBgm();
        this.bgmMode = "slow";
      }
      this.bgmSlow.aud.playbackRate = 1+factor;
      this.bgm.gain.gain.value = 0.0;
      this.bgmSlow.gain.gain.value = 1.0;
    }
  }*/

  arcAroundHole(b, hole, size) {
    this.arcs.push(new Arc(b, -90, hole-size));
    this.arcs.push(new Arc(b, hole+size, 90));
  }
  
  loadMap(map) {
    
  }

  syncBgm() {
    console.log("bgm sync");
    this.bgm.aud.currentTime = this.game.gametime.now/1000;
    //this.bgmSlow.aud.currentTime = this.game.gametime.now/500;
  }
  
  resize() {
  }

  reset() {    
    this.game.gametime.now-= (Math.floor((this.game.gametime.now/4/60000)*BPM)/BPM)*4*60000 - this.checkpoint;
    console.log("RESET TO " + this.game.gametime.now);
    this.playerAngleTarget = 0;
    for(let i = 0; i < this.arcs.length; i++) {
      this.arcs[i].scored = false;
    }
    this.game.sfx.playSound(this.assets.sfx.crash, 0.3);
    this.syncBgm();
    this.score = this.scoreAtCheckpoint;
  }
  
  render() {    
    if(this.game.gametime.now > 1000 && !this.synced) {
      this.game.gametime.now = 0;
      this.bgm.gain.gain.value = 1.0;
      this.syncBgm();
      
      this.synced = true;
    }
    this.beat = BPM*(this.game.gametime.now/60000);
    if(this.beat >= 60 && this.checkpointNo < 1) {
      this.checkpoint = this.game.gametime.now;
      this.checkpointNo = 1;
      this.scoreAtCheckpoint = this.score;
    }
    if(this.beat >= 96 && this.checkpointNo < 2) {
      this.checkpoint = this.game.gametime.now;
      this.checkpointNo = 2;
      this.scoreAtCheckpoint = this.score;
    }
    
    //this.bgm.setSpeed(1-((1-this.game.gametime.factor)/2));
    this.centerX = 0;
    this.centerY = -this.camera.height/2-100;
    
    //this.playerAngle+= (this.playerAngleTarget-this.playerAngle)*(this.game.gametime.delta/1000.0)*20;
    this.playerAngle+= (this.playerAngleTarget-this.playerAngle)*Math.pow(1/3, this.game.gametime.delta*60/1000);
    
    this.game.gfx.lookThrough(this.camera);
    this.game.gfx.clearScreen(SKY_COLOR);
    let beat0 = -this.centerY+(this.camera.height/2)-40;

    let ctx = this.game.gfx.ctx;
    ctx.translate(-this.centerX, this.centerY);
    ctx.save();

    ctx.strokeStyle = "#0D001D";
    for(let angle = -90; angle <= 90; angle+= this.lineInterval) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(1000*Math.cos(toRad(angle+90)), 1000*Math.sin(toRad(angle+90)));
      ctx.stroke();
    }
    
    ctx.rotate(-toRad(this.playerAngle*this.lineInterval));
    ctx.translate(this.centerX, -this.centerY);

    ctx.fillStyle = "white";
    ctx.beginPath();
    let y = beat0+this.centerY;
    let sz = 10;
    ctx.moveTo(-sz, y+(sz*Math.sqrt(3)));
    ctx.lineTo(sz, y+(sz*Math.sqrt(3)));
    ctx.lineTo(0, y);
    ctx.fill();
    
    ctx.restore();

    let scored = false;
    for(let i = 0; i < this.arcs.length; i++) {
      this.arcs[i].draw(ctx, this.beat, beat0);
      this.arcs[i].update(this.game.gametime.delta/1000);
      if(this.arcs[i].inRange(this.beat)) {
        if(this.arcs[i].hit(this.playerAngle*-this.lineInterval, sz, y)) {
          this.reset();
          scored = false;
          break;
        } else if(!this.arcs[i].scored) {
          scored = true;
          this.arcs[i].scored = true;
        }
      }
    }

    if(scored) {
      this.score++;
    }

    let gtx = this.game.gfx.ctx;
    gtx.resetTransform();
    gtx.font = "30px monospace";
    let w = gtx.measureText(this.score).width;
    gtx.fillStyle = "black"; gtx.fillText(this.score, this.game.gfx.width-w-1, this.game.gfx.height-1);
    gtx.fillStyle = "white"; gtx.fillText(this.score, this.game.gfx.width-w-2, this.game.gfx.height-2);
    
    for(let i = 0; i < this.messages.length; i++) {
      this.messages[i].draw(this.game.gfx, this.beat);
    }
    
    if(this.input.right.pressed() && this.playerAngleTarget < 6 && (this.playerAngleTarget-this.playerAngle) < 0.03) {
      this.playerAngleTarget++;
    }
    if(this.input.left.pressed() && this.playerAngleTarget > -6 && (this.playerAngle - this.playerAngleTarget) < 0.03) {
      this.playerAngleTarget--;
    }

    /*
    if(this.input.left.pressed() && this.input.right.pressed()) {
      if(this.slowActivateTimer <= 0) {
        this.slowActivateTimer = 0.5;
      } else {
        this.slowActivateTimer-= this.game.realtime.delta/1000;
        if(this.slowActivateTimer <= 0) {
          this.slowTimer = 3.0;
        }
      }
    }
    if(this.slowTimer > 0) {
      this.slowTimer-= this.game.realtime.delta/1000;
      this.setSlow(3.0-this.slowTimer);
    } else {
      this.setSlow(3);
    }
    /*
    if(this.game.gametime.factor > 0.9 && this.timeTarget == 1.0) {
      this.game.gametime.factor = 1.0;
      if(this.input.left.pressed() && this.input.right.pressed()) {
        this.timeTarget = 0.4;
      }
    } else {
      if(this.game.gametime.factor-this.timeTarget < 0.05) {
        this.timeTarget = 1.0;
      }
    }
    this.game.gametime.factor+= (this.timeTarget-this.game.gametime.factor)*(this.game.realtime.delta/1000.0)*2.0;
    */

    if(this.beat > this.end) {
      let foo = (this.beat-this.end)/4;
      if(foo > 1) {
        foo = 1;
      }
      this.fadeColor.alpha = foo;
      this.game.gfx.clearScreen(this.fadeColor);
      if(this.beat - 4 > this.end) {
        this.bgm.gain.gain.value = 0;
        this.game.state = new EndState(this.game);
      }
    }
  }
}
