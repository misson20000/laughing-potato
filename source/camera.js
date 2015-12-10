export class Camera {
  constructor(viewport) {
    this.pos = {};
    this.pos.x = 0;
    this.pos.y = 0;
    this.scale = 1;

    this._px = 0;
    this._py = 0;
  }
  centerOnPoint(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
  setScale(s) {
    this.scale = s;
  }

  update(viewport) {
    this._px = this.pos.x - Math.floor(viewport.width/2);
    this._py = this.pos.y - Math.floor(viewport.height/2);
    this.width = viewport.width/this.scale;
    this.height = viewport.height/this.scale;
  }
  
  projectX(x) {
    return (x * this.scale) - this._px;
  }
  projectY(y) {
    return (y * this.scale) - this._py;
  }
  projectW(w) {
    return w*this.scale;
  }
  projectH(h) {
    return h*this.scale;
  }
}

export class NullCamera {
  constructor(viewport) { }
  update(viewport) {}
  projectX(x) { return x; }
  projectY(y) { return y; }
  projectW(w) { return w; }
  projectH(h) { return h; }
}
