import {Asset} from "./assetmanager.js";

export class GFXCore {
  constructor(game, canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    
    this.black = new Color(0, 0, 0);
    this.red = new Color(255, 0, 0);
    this.green = new Color(0, 255, 0);
    this.blue = new Color(0, 0, 255);
    this.white = new Color(255, 255, 255);
    
    this.game = game;
    this.ctx.save();
  }

  resize() {
    let pw = this.width;
    let ph = this.height;
    this.width  = this.canvas.width  = window.innerWidth ;
    this.height = this.canvas.height = window.innerHeight;
    if(this.currentCamera) {
      this.lookThrough(this.currentCamera);
    }
    if((pw != this.width || ph != this.height) && this.game.state && this.game.state.resize) {
      this.game.state.resize();
    }
  }

  lookThrough(camera) {
    this.currentCamera = camera;
    this.currentCamera.update(this);
  }

  clearScreen(color) {
    this.ctx.fillStyle = color.toCSS();
    this.ctx.globalAlpha = color.alpha;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalAlpha = 1;
  }

  fillCircle(x, y, r, color) {
    this.ctx.fillStyle = color.toCSS();
    this.ctx.globalAlpha = color.alpha;
    this.ctx.strokeStyle = "none";
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2*Math.PI, false);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }
  
  fillRect(x, y, w, h, color) {
    this.ctx.fillStyle = color.toCSS();
    this.ctx.globalAlpha = color.alpha;
    this.ctx.strokeStyle = "none";
    this.ctx.fillRect(x, y, w, h);
    this.ctx.globalAlpha = 1;
  }

  outlineRect(x, y, w, h, color) {
    this.ctx.strokeStyle = "1px solid " + color.toCSS();
    this.ctx.globalAlpha = color.alpha;
    this.ctx.strokeRect(x, y, w, h);
    this.ctx.globalAlpha = 1;
  }

  setTranslucency(t) {
    this.ctx.globalAlpha = t;
  }

  setBlendMode(b) {
    this.ctx.globalCompositeOperation = b;
  }
  
  drawImage(img, x, y) {
    //for some reason it doesn't work it I put this somewhere else?
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    
    this.ctx.drawImage(
      img.data, x, y);
  }

  drawText(txt, x, y, color) {
    this.ctx.fillStyle = color.toCSS();
    this.ctx.globalAlpha = color.alpha;
    this.ctx.font = "12px monospace";
    this.ctx.fillText(
      txt, x, y);
    this.ctx.globalAlpha = 1;

    return this.textWidth(txt);
  }

  textWidth(txt) {
    return this.ctx.measureText(txt).width;
  }
  
  imageLoader() {
    let loader = {load: (res) => {
      let img = new Image();
      img.src = URL.createObjectURL(res.blob);
      return new Promise((resolve, reject) => {
        img.onload = () => {resolve(img);};
        img.onerror = reject;
        if(img.complete) { resolve(img); }
      });
    }};

    return loader;
  }
}

export class Color {
  constructor(r, g, b, a=255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.alpha = a/255;
  }

  toCSS() {
    return "#" +
      (this.r < 16 ? "0" : "") + this.r.toString(16) +
      (this.g < 16 ? "0" : "") + this.g.toString(16) +
      (this.b < 16 ? "0" : "") + this.b.toString(16);
  }
}
