import {Asset} from "./assetmanager.js";
import {FilePromiseReader} from "./util.js";

export class Sound {
  constructor(src, gain) {
    this.src = src;
    this.gain = gain;
  }
}

export class SFXCore {
  constructor(game) {
    this.ctx = new AudioContext();
  }

  soundLoader() {
    let loader = {load: (res) => {
      return new FilePromiseReader(res.blob).arrayBuffer().then((ab) => {
        return this.ctx.decodeAudioData(ab);
      });
    }};

    return loader;
  }

  playSound(ast, vol=1.0) {
    let src = this.ctx.createBufferSource();
    src.buffer = ast.data;
    let gain = this.ctx.createGain();
    src.connect(gain);
    gain.gain.value = vol;
    gain.connect(this.ctx.destination);
    src.start();
    return new Sound(src, gain);
  }
}
