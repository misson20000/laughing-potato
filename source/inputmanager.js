export class InputManager {
  constructor(elem, debug) {
    this.dbg = debug;
    this.element = elem;
    this._lastInput = [];
    this._betweenInput = [];
    this._input = [];
    this._keys = [];
    this._keymap = {};

    this.up    = new Key(this, ["ArrowUp"   , "KeyW"]);
    this.left  = new Key(this, ["ArrowLeft" , "KeyA"]);
    this.down  = new Key(this, ["ArrowDown" , "KeyS"]);
    this.right = new Key(this, ["ArrowRight", "KeyD"]);
    
    document.addEventListener("keydown", (e) => {
      if(e.code == "Backquote") {
        this.dbg.active = !this.dbg.active;
      } else if(this.dbg.active) {
        this.dbg.key(e);
      } else if(this._keymap[e.code]) {
        this._betweenInput[this._keymap[e.code]] = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if(!this.dbg.active && this._keymap[e.code]) {
        this._betweenInput[this._keymap[e.code]] = false;
      }
    });
  }

  beginFrame() {
    for(let k in this._input) {
      this._lastInput[k] = this._input[k];
    }
    for(let k in this._betweenInput) {
      this._input[k] = this._betweenInput[k];
    }
  }
}

class Key {
  constructor(input, keys) {
    this.input = input;
    this.id = input._keys.length;
    for(let k in keys) {
      input._keymap[keys[k]] = this.id;
    }
    input._keys.push(this);
  }

  pressed() {
    return this.input._input[this.id];
  }

  justPressed() {
    return this.input._input[this.id] && !this.input._lastInput[this.id];
  }

  justReleased() {
    return this.input._input[this.id] && !this.input._lastInput[this.id];
  }
}
