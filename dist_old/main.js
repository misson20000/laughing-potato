"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AssetManager = (function () {
  function AssetManager(resourceManager, dbg) {
    _classCallCheck(this, AssetManager);

    this.resourceManager = resourceManager;
    this.dbg = dbg;
    this.assets = {};
    this.directAssets = {};
    this.loaders = {};
    this.assetList = [];

    var dataLoader = undefined;
    this.addLoader("data", dataLoader = { load: function load(res) {
        return new Promise(function (resolve, reject) {
          var fileReader = new FileReader();
          fileReader.onload = function () {
            resolve(fileReader.result);
          };
          fileReader.readAsArrayBuffer(res.blob);
        });
      } });
  }

  _createClass(AssetManager, [{
    key: "addLoader",
    value: function addLoader(type, loader) {
      this.loaders[type] = loader;
    }
  }, {
    key: "promiseAsset",
    value: function promiseAsset(ast) {
      var _this = this;

      if (this.assetPromises[ast]) {
        return this.assetPromises[ast].promise;
      } else {
        this.assetPromises[ast] = {};
        return this.assetPromises[ast].promise = new Promise(function (resolve, reject) {
          _this.assetPromises[ast].resolve = resolve;
          _this.assetPromises[ast].reject = reject;
          if (_this.directAssets[ast]) {
            resolve(_this.directAssets[ast]);
          }
        });
      }
    }
  }, {
    key: "load",
    value: function load(resource, via, target) {
      var _this2 = this;

      var o = this.assets;
      var a = target.split(".");
      var i = 0;
      this.dbg.log("loading " + target);
      for (i = 0; i < a.length - 1; i++) {
        if (o[a[i]] == undefined) {
          this.dbg.log("create " + a[i]);
          o[a[i]] = {};
        }
        this.dbg.log("sub " + a[i]);
        o = o[a[i]];
      }
      this.dbg.log("set " + a[i]);
      var asset = new Asset(null, resource.url, this.loaders[via]);
      o[a[i]] = asset;
      this.directAssets[target] = asset;
      this.assetList.push(asset);
      return asset.promise = this.loaders[via].load(resource).then(function (dat) {
        asset.data = dat;
        _this2.dbg.log(target + " promise resolved");
        return asset;
      }, function (reason) {
        _this2.dbg.log(target + " promise rejected because " + reason);
      });
    }
  }, {
    key: "reload",
    value: function reload(asset) {
      this.resourceManager.reload(asset.url).then(function (res) {
        return asset.loader.load(res);
      }).then(function (new_asset) {
        asset._reload(new_asset);
      });
    }
  }, {
    key: "reloadAll",
    value: function reloadAll() {
      for (var a in this.assetList) {
        this.reload(this.assetList[a]);
      }
    }
  }]);

  return AssetManager;
})();

var Asset = (function () {
  function Asset(dat, url, loader) {
    _classCallCheck(this, Asset);

    this.data = dat;
    this.url = url;
    this.loader = loader;
    this.promise = null;
  }

  _createClass(Asset, [{
    key: "reload",
    value: function reload() {
      theGame.assetManager.reload(this);
    }
  }, {
    key: "_reload",
    value: function _reload(new_asset) {
      this.data = new_asset.data;
    }
  }]);

  return Asset;
})();

var GFXCore = (function () {
  function GFXCore(game, canvas) {
    _classCallCheck(this, GFXCore);

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

  _createClass(GFXCore, [{
    key: "resize",
    value: function resize() {
      var pw = this.width;
      var ph = this.height;
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      if (this.currentCamera) {
        this.lookThrough(this.currentCamera);
      }
      if ((pw != this.width || ph != this.height) && this.game.state && this.game.state.resize) {
        this.game.state.resize();
      }
    }
  }, {
    key: "lookThrough",
    value: function lookThrough(camera) {
      this.currentCamera = camera;
      this.currentCamera.update(this);
    }
  }, {
    key: "clearScreen",
    value: function clearScreen(color) {
      this.ctx.fillStyle = color.toCSS();
      this.ctx.globalAlpha = color.alpha;
      this.ctx.save();
      this.ctx.resetTransform();
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
      this.ctx.globalAlpha = 1;
    }
  }, {
    key: "fillCircle",
    value: function fillCircle(x, y, r, color) {
      this.ctx.fillStyle = color.toCSS();
      this.ctx.globalAlpha = color.alpha;
      this.ctx.strokeStyle = "none";
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    }
  }, {
    key: "fillRect",
    value: function fillRect(x, y, w, h, color) {
      this.ctx.fillStyle = color.toCSS();
      this.ctx.globalAlpha = color.alpha;
      this.ctx.strokeStyle = "none";
      this.ctx.fillRect(x, y, w, h);
      this.ctx.globalAlpha = 1;
    }
  }, {
    key: "outlineRect",
    value: function outlineRect(x, y, w, h, color) {
      this.ctx.strokeStyle = "1px solid " + color.toCSS();
      this.ctx.globalAlpha = color.alpha;
      this.ctx.strokeRect(x, y, w, h);
      this.ctx.globalAlpha = 1;
    }
  }, {
    key: "setTranslucency",
    value: function setTranslucency(t) {
      this.ctx.globalAlpha = t;
    }
  }, {
    key: "setBlendMode",
    value: function setBlendMode(b) {
      this.ctx.globalCompositeOperation = b;
    }
  }, {
    key: "drawImage",
    value: function drawImage(img, x, y) {
      var spin = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

      //for some reason it doesn't work it I put this somewhere else?
      this.ctx.mozImageSmoothingEnabled = false;
      this.ctx.webkitImageSmoothingEnabled = false;
      this.ctx.msImageSmoothingEnabled = false;
      this.ctx.imageSmoothingEnabled = false;

      if (spin == 0) {
        this.ctx.drawImage(img.data, x, y);
      } else {
        this.ctx.save();
        this.ctx.translate(x + img.data.width / 2, y + img.data.width / 2);
        this.ctx.rotate(spin);
        this.ctx.drawImage(img.data, -img.data.width / 2, -img.data.height / 2);
        this.ctx.restore();
      }
    }
  }, {
    key: "drawText",
    value: function drawText(txt, x, y, color) {
      this.ctx.fillStyle = color.toCSS();
      this.ctx.globalAlpha = color.alpha;
      this.ctx.font = "12px monospace";
      this.ctx.fillText(txt, x, y);
      this.ctx.globalAlpha = 1;

      return this.textWidth(txt);
    }
  }, {
    key: "textWidth",
    value: function textWidth(txt) {
      return this.ctx.measureText(txt).width;
    }
  }, {
    key: "imageLoader",
    value: function imageLoader() {
      var loader = { load: function load(res) {
          var img = new Image();
          img.src = URL.createObjectURL(res.blob);
          return new Promise(function (resolve, reject) {
            img.onload = function () {
              resolve(img);
            };
            img.onerror = reject;
            if (img.complete) {
              resolve(img);
            }
          });
        } };

      return loader;
    }
  }]);

  return GFXCore;
})();

var Color = (function () {
  function Color(r, g, b) {
    var a = arguments.length <= 3 || arguments[3] === undefined ? 255 : arguments[3];

    _classCallCheck(this, Color);

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.alpha = a / 255;
    this.css = "#" + (this.r < 16 ? "0" : "") + this.r.toString(16) + (this.g < 16 ? "0" : "") + this.g.toString(16) + (this.b < 16 ? "0" : "") + this.b.toString(16);
  }

  _createClass(Color, [{
    key: "toCSS",
    value: function toCSS() {
      return this.css;
    }
  }]);

  return Color;
})();

var FilePromiseReader = (function () {
  function FilePromiseReader(file) {
    _classCallCheck(this, FilePromiseReader);

    this.reader = new FileReader();
    this.file = file;
  }

  _createClass(FilePromiseReader, [{
    key: "arrayBuffer",
    value: function arrayBuffer() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.reader.onload = function () {
          resolve(_this3.reader.result);
        };
        _this3.reader.onerror = function () {
          reject(_this3.reader.error);
        };
        _this3.reader.readAsArrayBuffer(_this3.file);
      });
    }
  }]);

  return FilePromiseReader;
})();

var Sound = function Sound(src, gain) {
  _classCallCheck(this, Sound);

  this.src = src;
  this.gain = gain;
};

var SFXCore = (function () {
  function SFXCore(game) {
    _classCallCheck(this, SFXCore);

    this.ctx = new AudioContext();
  }

  _createClass(SFXCore, [{
    key: "soundLoader",
    value: function soundLoader() {
      var _this4 = this;

      var loader = { load: function load(res) {
          return new FilePromiseReader(res.blob).arrayBuffer().then(function (ab) {
            return _this4.ctx.decodeAudioData(ab);
          });
        } };

      return loader;
    }
  }, {
    key: "playSound",
    value: function playSound(ast) {
      var vol = arguments.length <= 1 || arguments[1] === undefined ? 1.0 : arguments[1];

      var src = this.ctx.createBufferSource();
      src.buffer = ast.data;
      var gain = this.ctx.createGain();
      src.connect(gain);
      gain.gain.value = vol;
      gain.connect(this.ctx.destination);
      src.start();
      return new Sound(src, gain);
    }
  }]);

  return SFXCore;
})();

var ResourceManager = (function () {
  function ResourceManager(dbg) {
    _classCallCheck(this, ResourceManager);

    this.providers = [];
    this._queue = [];
    this.resources = {};
    this.status = "idle";
    this.dbg = dbg;
  }

  _createClass(ResourceManager, [{
    key: "addResourceProvider",
    value: function addResourceProvider(priority, provider) {
      this.providers.push({ priority: priority, provider: provider });
      this.providers.sort(function (a, b) {
        if (a[0] < b[0]) {
          return 1;
        }
        if (a[0] > b[0]) {
          return -1;
        }
        return 0;
      });
    }
  }, {
    key: "_tryDL",
    value: function _tryDL(job, providerNum) {
      var _this5 = this;

      if (providerNum >= this.providers.length) {
        //ran out of providers
        this.dbg.log("ran out of providers");
        this.status = "failed";
        job.reject();
        this.failedResource = job.url;
        return;
      }
      this.dbg.log("Trying to load '" + job.url + "' with provider " + providerNum);

      this.loading = job.url;
      this.providers[providerNum].provider.provide(job.url, this.dbg).then(function (resource) {
        return resource.blob();
      }, function (reason) {
        // failiure
        _this5.dbg.log("failiure, trying next provider");
        _this5._tryDL(job, providerNum + 1);
      }).then(function (resource) {
        // success
        _this5.dbg.log("success");
        var fin = new Resource(job.url, resource);
        _this5.resources[job.url] = fin;
        job.resolve(fin);
        _this5._queue.shift();
        if (_this5._queue.length > 0) {
          _this5._tryDL(_this5._queue[0], 0);
        } else {
          _this5.dbg.log("finished queue");
          _this5.status = "idle";
          return;
        }
      });
    }
  }, {
    key: "flush",
    value: function flush() {
      this.status = "loading";
      this._tryDL(this._queue[0], 0);
    }
  }, {
    key: "reload",
    value: function reload(resource) {
      var _this6 = this;

      this.status = "loading";
      return new Promise(function (resolve, reject) {
        _this6._tryDL({ url: resource, resolve: resolve, reject: reject }, 0);
      });
    }
  }, {
    key: "queue",
    value: function queue(resource) {
      var self = this;
      this.dbg.log("Queued " + resource);
      return new Promise(function (resolve, reject) {
        self._queue.push({ url: resource, resolve: resolve, reject: reject });
      });
    }
  }]);

  return ResourceManager;
})();

var Resource = function Resource(url, blob) {
  _classCallCheck(this, Resource);

  this.url = url;
  this.blob = blob;
};

var ResourceDownloader = (function () {
  function ResourceDownloader() {
    _classCallCheck(this, ResourceDownloader);
  }

  _createClass(ResourceDownloader, [{
    key: "provide",
    value: function provide(url, dbg) {
      dbg.log("dl " + url);
      return new Promise(function (resolve, reject) {
        fetch(url).then(function (response) {
          dbg.log("got response");
          if (response.ok) {
            dbg.log("ok, resolving");
            resolve(response);
          } else {
            dbg.log("failed, rejecting");
            reject(response.status + " " + response.statusText);
          }
        }, function (fail) {
          dbg.log("fetch rejected");
          reject(fail);
        });
      });
    }
  }]);

  return ResourceDownloader;
})();

var Camera = (function () {
  function Camera(viewport) {
    _classCallCheck(this, Camera);

    this.pos = {};
    this.pos.x = 0;
    this.pos.y = 0;
    this.scale = 1;
    this.rotate = 0;

    this._px = 0;
    this._py = 0;
  }

  _createClass(Camera, [{
    key: "centerOnPoint",
    value: function centerOnPoint(x, y) {
      this.pos.x = x;
      this.pos.y = y;
    }
  }, {
    key: "setScale",
    value: function setScale(s) {
      this.scale = s;
    }
  }, {
    key: "update",
    value: function update(viewport) {
      this._px = this.pos.x - Math.floor(viewport.width / 2);
      this._py = this.pos.y - Math.floor(viewport.height / 2);
      this.width = viewport.width / this.scale;
      this.height = viewport.height / this.scale;

      viewport.ctx.resetTransform();
      viewport.ctx.translate(-this._px, -this._py);
      viewport.ctx.scale(this.scale, this.scale);
      viewport.ctx.rotate(this.rotate);
    }
  }]);

  return Camera;
})();

var NullCamera = (function () {
  function NullCamera(viewport) {
    _classCallCheck(this, NullCamera);
  }

  _createClass(NullCamera, [{
    key: "update",
    value: function update(viewport) {
      viewport.ctx.resetTransform();
    }
  }]);

  return NullCamera;
})();

var GFXTestState = (function () {
  function GFXTestState(game) {
    _classCallCheck(this, GFXTestState);

    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
    this.hud = new NullCamera();
    this.fps = [];
  }

  _createClass(GFXTestState, [{
    key: "render",
    value: function render() {

      /* FPS Graph
      this.game.gfx.lookThrough(this.hud);
      this.fps[this.fps.length >= 300 ? 299 : this.fps.length] = 1000.0/this.game.gametime.delta;
      if(this.fps.length >= 300) {
        for(let i = 1; i < this.fps.length; i++) {
          this.fps[i-1] = this.fps[i];
        }
      }
      this.game.gfx.drawText("FPS:", 0, 12, this.game.gfx.white);
      for(let i = 0; i < this.fps.length; i++) {
        this.game.gfx.fillRect(i, 212-(this.fps[i]*200/60), 1, this.fps[i]*200/60, this.game.gfx.red);
      }
      for(let fps = 0; fps <= 60; fps+= 10) {
        this.game.gfx.fillRect(0, 212-(fps*200/60), 305, 1, this.game.gfx.white);
        this.game.gfx.drawText(fps, 300, 212-(fps*200/60), this.game.gfx.white);
      }
      */
      this.game.gfx.lookThrough(this.camera);
      this.game.gfx.fillRect(-100, 10, 200, 10, this.game.gfx.blue);
      this.game.gfx.fillRect(-100, -50, 10, 60, this.game.gfx.green);
      this.camera.rotate += this.game.gametime.delta / 1000.0;
      this.camera.scale = Math.sin(this.game.gametime.now / 1000.0) + 2.0;
    }
  }]);

  return GFXTestState;
})();

function pushB(a, b) {
  this.push(b);
}

function node() {
  var self = undefined;
  var nodeMap = new Map();

  var set = function set(node, value) {
    if (value === undefined && !nodeMap.has(node) || nodeMap.get(node) !== value) {
      nodeMap.set(node, value);
      node.set(self, value);
      return true;
    }
    return false;
  };
  var link = function link(value) {
    var n = node();
    self.set(n, value);
    return n;
  };
  var remove = function remove(node) {
    if (nodeMap.has(node)) {
      nodeMap.delete(node);
      node.remove(self);
      return true;
    }
    return false;
  };
  var removeB = function removeB(a, b) {
    return remove(b);
  };
  var clear = function clear() {
    nodeMap.forEach(removeB);
  };
  var has = function has(node) {
    return nodeMap.has(node);
  };
  var get = function get(node) {
    return nodeMap.get(node);
  };
  var nodes = function nodes() {
    var keys = [];
    nodeMap.forEach(pushB, keys);
    return keys;
  };
  return self = {
    set: set, remove: remove, clear: clear, has: has, get: get, nodes: nodes, link: link, safeNodes: nodes
  };
}

// let SKY_COLOR = new Color(128, 128, 255); // day time
var SKY_COLOR = new Color(16, 0, 32); // night time

var PlayState = (function () {
  function PlayState(game) {
    _classCallCheck(this, PlayState);

    this.game = game;
    this.camera = new Camera();
    this.camera.scale = 3;
    this.assets = game.assetManager.assets;
    this.componentTypes = {
      physics: {
        main: node(),
        position: node(),
        velocity: node()
      },
      position: node(),
      image: node()
    };
    this.entities = node();

    this.game.sfx.playSound(this.assets.sfx.olrogue);
  }

  _createClass(PlayState, [{
    key: "render",
    value: function render() {
      var _this7 = this;

      this.game.gfx.lookThrough(this.camera);
      this.game.gfx.clearScreen(SKY_COLOR);

      this.game.gfx.drawImage(this.assets.object.moon, 70, -70);

      this.componentTypes.image.nodes().forEach(function (ent) {
        var dat = ent.get(_this7.componentTypes.image);
        _this7.game.gfx.drawImage(dat.asset, Math.floor(dat.position.x), Math.floor(dat.position.y));
      });
    }
  }]);

  return PlayState;
})();

// let SKY_COLOR = new Color(128, 128, 255); // day time

var SKY_COLOR$1 = new Color(16, 0, 32); // night time

var Snowflake = (function () {
  function Snowflake(state) {
    _classCallCheck(this, Snowflake);

    this.speed = 40 * (1 + Math.random());
    this.centerX = Math.random() * state.camera.width - state.camera.width / 2;
    this.wave = {
      phase: Math.random() * 2 * Math.PI,
      period: Math.random() * 1.0 + 3.0,
      amplitude: Math.random() * 20.0
    };
    this.x = this.centerX;
    this.y = Math.random() * state.camera.height - state.camera.height / 2;
    this.r = 0;
    this.rs = Math.PI * (Math.random() + 0.2);
    this.asset = state.assets.object.snowflake;
  }

  _createClass(Snowflake, [{
    key: "update",
    value: function update() {}
  }, {
    key: "render",
    value: function render(state, gfx) {
      var w = Math.sin(this.wave.phase + state.game.gametime.now / 1000.0 / this.wave.period * 2 * Math.PI);
      this.x = w * this.wave.amplitude + this.centerX;
      this.y += this.speed / 1000.0 * state.game.gametime.delta;
      //this.r = w * Math.PI / 4;
      this.r += this.rs / 1000.0 * state.game.gametime.delta;
      if (this.y > state.camera.height / 2) {
        this.y = -state.camera.height / 2 - 8;
      }
      gfx.drawImage(this.asset, this.x, this.y, this.r);
    }
  }]);

  return Snowflake;
})();

var SnowState = (function () {
  function SnowState(game) {
    _classCallCheck(this, SnowState);

    this.game = game;
    this.camera = new Camera();
    this.game.gfx.lookThrough(this.camera);
    this.assets = game.assetManager.assets;
    this.entities = [];

    this.resize();
  }

  _createClass(SnowState, [{
    key: "resize",
    value: function resize() {
      this.camera.scale = this.game.gfx.width / this.assets.object.snowhill.data.width;

      this.entities.length = 0;
      for (var i = 0; i < Math.floor(2000 / Math.pow(this.camera.scale, 2)); i++) {
        this.entities.push(new Snowflake(this));
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this8 = this;

      this.game.gfx.lookThrough(this.camera);
      this.game.gfx.clearScreen(SKY_COLOR$1);

      this.game.gfx.drawImage(this.assets.object.moon, 70, -70);

      this.entities.forEach(function (ent) {
        ent.update();
        ent.render(_this8, _this8.game.gfx);
      });

      this.game.gfx.drawImage(this.assets.object.snowhill, -(this.camera.width / 2), -(this.camera.height * (3 / 4)));
    }
  }]);

  return SnowState;
})();

var LoaderState = (function () {
  function LoaderState(game, resmgr, assetmgr) {
    var _this9 = this;

    _classCallCheck(this, LoaderState);

    this.resmgr = resmgr;
    this.assetmgr = assetmgr;
    this.game = game;
    this.dl = new ResourceDownloader();

    this.status = "Disovering assets...";

    this.camera = new Camera();

    this.resmgr.addResourceProvider(0, this.dl);
    this.resmgr.queue("assets.map").then(function (resource) {
      return new Promise(function (resolve, reject) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
          resolve(JSON.parse(fileReader.result));
        };
        fileReader.readAsText(resource.blob);
      });
    }).then(function (assetMap) {
      var promises = [];

      var _loop = function _loop(asset) {
        promises.push(_this9.resmgr.queue(assetMap[asset].url).then(function (resource) {
          return _this9.assetmgr.load(resource, assetMap[asset].type, assetMap[asset].asset);
        }));
      };

      for (var asset in assetMap) {
        _loop(asset);
      }
      _this9.status = "Downloading assets...";
      _this9.resmgr.flush();
      Promise.all(promises).then(function () {
        _this9.game.state = new SnowState(_this9.game);
      });
    });

    this.resmgr.flush();
  }

  _createClass(LoaderState, [{
    key: "render",
    value: function render() {
      this.game.gfx.lookThrough(this.camera);
      var color = undefined;
      if (this.resmgr.status == "idle") {
        color = this.game.gfx.green;
      }
      if (this.resmgr.status == "failed") {
        color = this.game.gfx.red;
      }
      if (this.resmgr.status == "loading") {
        color = this.game.gfx.blue;
      }
      this.game.gfx.fillRect(-50, -50, 100, 100, color);
    }
  }]);

  return LoaderState;
})();

var DebugOutput = (function () {
  function DebugOutput(out) {
    var prefix = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

    _classCallCheck(this, DebugOutput);

    this.out = out;
    this.prefix = prefix;
  }

  _createClass(DebugOutput, [{
    key: "log",
    value: function log(str) {
      this.out.log(this.prefix + str);
    }
  }, {
    key: "wrap",
    value: function wrap() {
      var prefix = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

      return new DebugOutput(this, prefix);
    }
  }]);

  return DebugOutput;
})();

var OVERLAY_COLOR = new Color(0, 0, 0, 70);
var PROMPT_COLOR = new Color(0, 0, 0, 200);
var TEXT_COLOR = new Color(220, 220, 200);

var Debug = (function () {
  function Debug(game) {
    var _this10 = this;

    _classCallCheck(this, Debug);

    this.active = false;
    this.game = game;
    this.camera = new NullCamera();
    this.consoleArea = { x: 0, y: 0, w: 500, h: 500 };
    this.promptArea = { x: 0, y: 500, w: 500, h: 15 };
    this.dropdownVel = 0;
    this.dropdownY = -500;
    this._log = [];
    this.logColors = {
      normal: new Color(220, 220, 220),
      error: new Color(220, 20, 20)
    };
    this.commandHistory = [];
    this.commandFuture = [];

    var stateMap = {
      snow: SnowState,
      play: PlayState,
      "gfx test": GFXTestState,
      gfxtest: GFXTestState
    };

    this.commands = {
      set: function set(parts) {
        var a = undefined,
            b = undefined;
        if (parts.length == 2) {
          a = parts[0];
          b = parts[1];
        } else {
          var i = parts.indexOf("to");
          if (i == undefined) {
            _this10.logError("Invalid syntax. Usage: set <a> [to] <b> / set <a> <b> if a and b are each only one word");
            return;
          }
          a = parts.slice(0, i).join(" ");
          b = parts.slice(i + 1).join(" ");
        }
        switch (a) {
          case "state":
            if (!stateMap[b]) {
              _this10.logError("No such state '" + b + "'");
              return;
            }
            _this10.game.state = new stateMap[b](_this10.game);
            break;
          default:
            _this10.logError("'" + a + "' not recognized");
            return;
        }
      },
      reload: function reload(parts) {
        if (parts[0] == "all") {
          if (parts[1] == "assets") {
            _this10.log("reloading assets...");
            _this10.game.assetManager.reloadAll();
          } else {
            _this10.logError("'" + parts[1] + "' not recognized.");
          }
        } else if (parts[0] == "asset") {
          if (_this10.game.assetManager.directAssets[parts[1]]) {
            _this10.log("reloading '" + parts[1] + "'");
            _this10.game.assetManager.directAssets[parts[1]].reload();
          } else {
            _this10.logError("no such asset");
          }
        } else {
          if (_this10.game.assetManager.directAssets[parts[0]]) {
            _this10.log("reloading '" + parts[0] + "'");
            _this10.game.assetManager.directAssets[parts[0]].reload();
          } else {
            _this10.logError("'" + parts[0] + "' not recognized.");
          }
        }
      }
    };

    this.prompt = {
      before: "",
      cursor: " ",
      after: "",

      blinkState: true,
      blinkTimer: 0
    };
  }

  _createClass(Debug, [{
    key: "log",
    value: function log(str) {
      console.log(str);
      this._log.push({ mode: "normal", msg: str });
    }
  }, {
    key: "logError",
    value: function logError(str) {
      console.log(str);
      this._log.push({ mode: "error", msg: str });
    }
  }, {
    key: "out",
    value: function out(prefix) {
      return new DebugOutput(this, prefix + ": ");
    }
  }, {
    key: "key",
    value: function key(evt) {
      if (evt.ctrlKey) {
        var preventDefault = true;
        switch (evt.code) {
          case "KeyA":
            this.prompt.blinkState = true;
            this.prompt.blinkTimer = 500;
            var t = this.prompt.before + this.prompt.cursor + this.prompt.after;
            this.prompt.before = "";
            this.prompt.cursor = t[0];
            this.prompt.after = t.slice(1);
            break;
          case "KeyE":
            this.prompt.blinkState = true;
            this.prompt.blinkTimer = 500;
            this.prompt.before = (this.prompt.before + this.prompt.cursor + this.prompt.after).slice(0, -1);
            this.prompt.cursor = " ";
            this.prompt.after = "";
            break;
          case "KeyK":
            this.prompt.kill = (this.prompt.cursor + this.prompt.after).slice(0, -1);
            this.prompt.cursor = " ";
            this.prompt.after = "";
            break;
          case "KeyY":
            this.prompt.before += this.prompt.kill;
            break;
          default:
            preventDefault = false;
        }

        if (preventDefault) {
          evt.preventDefault();
        }
      } else {
        if (evt.key.length == 1) {
          this.prompt.before += evt.key;
        } else {
          switch (evt.code) {
            case "ArrowLeft":
              if (this.prompt.before.length > 0) {
                this.prompt.after = this.prompt.cursor + this.prompt.after;
                this.prompt.cursor = this.prompt.before[this.prompt.before.length - 1];
              }
            case "Backspace":
              //fall-through
              this.prompt.blinkState = true;
              this.prompt.blinkTimer = 500;

              if (this.prompt.before.length > 0) {
                this.prompt.before = this.prompt.before.slice(0, -1);
              }
              break;
            case "ArrowRight":
              if (this.prompt.after.length > 0) {
                this.prompt.before += this.prompt.cursor;
              }
            case "Delete":
              //fall-through
              this.prompt.blinkState = true;
              this.prompt.blinkTimer = 500;
              if (this.prompt.after.length > 0) {
                this.prompt.cursor = this.prompt.after[0];
                this.prompt.after = this.prompt.after.slice(1);
              }
              break;
            case "ArrowUp":
              if (this.commandHistory.length > 0) {
                this.commandFuture.push((this.prompt.before + this.prompt.cursor + this.prompt.after).slice(0, -1));
                this.prompt.before = this.commandHistory.pop();
                this.prompt.cursor = " ";
                this.prompt.after = "";
              }
              break;
            case "ArrowDown":
              if (this.commandFuture.length > 0) {
                this.commandHistory.push((this.prompt.before + this.prompt.cursor + this.prompt.after).slice(0, -1));
                this.prompt.before = this.commandFuture.pop();
                this.prompt.cursor = " ";
                this.prompt.after = "";
              }
              break;
            case "End":
              this.prompt.blinkState = true;
              this.prompt.blinkTimer = 500;
              this.prompt.before = (this.prompt.before + this.prompt.cursor + this.prompt.after).slice(0, -1);
              this.prompt.cursor = " ";
              this.prompt.after = "";
              break;
            case "Home":
              this.prompt.blinkState = true;
              this.prompt.blinkTimer = 500;
              var t = this.prompt.before + this.prompt.cursor + this.prompt.after;
              this.prompt.before = "";
              this.prompt.cursor = t[0];
              this.prompt.after = t.slice(1);
              break;
            case "Enter":
              this.prompt.blinkState = true;
              this.prompt.blinkTimer = 500;
              this.handleCommand((this.prompt.before + this.prompt.cursor + this.prompt.after).slice(0, -1));
              this.prompt.before = this.prompt.after = "";
              this.prompt.cursor = " ";
          }
        }
      }
    }
  }, {
    key: "handleCommand",
    value: function handleCommand(cmd) {
      this.commandHistory = this.commandHistory.concat(this.commandFuture);
      if (this.commandFuture.length > 0) {
        this.commandHistory.pop();
      }
      this.commandFuture = [];
      this.commandHistory.push(cmd);
      var parts = cmd.split(" ");
      if (parts.length == 0) {
        this.logError("empty command");
        return;
      }
      if (cmd.startsWith("js: ")) {
        this.log("> " + new Function(cmd.slice(4))().toString());
      } else {
        if (this.commands[parts[0]]) {
          this.commands[parts.shift()](parts);
        } else {
          this.logError(parts[0] + ": command not found");
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (this.active) {
        if (this.dropdownY < 0) {
          this.dropdownY += this.dropdownVel * this.game.realtime.delta;
          this.dropdownVel += .01 * this.game.realtime.delta;
        }
        if (this.dropdownY >= 0) {
          this.dropdownY = 0;
          this.dropdownVel = 0;
        }
      } else {
        if (this.dropdownY > -515) {
          this.dropdownY += this.dropdownVel * this.game.realtime.delta;
          this.dropdownVel -= .01 * this.game.realtime.delta;
        } else {
          this.dropdownY = -515;
          this.dropdownVel = 0;
        }
      }

      if (this.active) {
        this.prompt.blinkTimer -= this.game.realtime.delta;
        if (this.prompt.blinkTimer <= 0) {
          this.prompt.blinkTimer = 500;
          this.prompt.blinkState = !this.prompt.blinkState;
        }
      }

      this.consoleArea.y = this.dropdownY;
      this.promptArea.y = this.dropdownY + this.consoleArea.h;

      this.game.gfx.lookThrough(this.camera);
      this.game.gfx.fillRect(this.consoleArea.x, this.consoleArea.y, this.consoleArea.w, this.consoleArea.h, OVERLAY_COLOR);
      this.game.gfx.fillRect(this.promptArea.x, this.promptArea.y, this.promptArea.w, this.promptArea.h, PROMPT_COLOR);

      if (this.dropdownY > -500) {
        var x = 5;
        var _y = this.promptArea.y + 11;
        x += this.game.gfx.drawText(this.prompt.before, x, _y, TEXT_COLOR);
        var cw = this.game.gfx.textWidth(this.prompt.cursor);
        if (this.prompt.blinkState) {
          this.game.gfx.fillRect(x, _y - 10, cw, 12, TEXT_COLOR);
        }
        this.game.gfx.drawText(this.prompt.cursor, x, _y, this.prompt.blinkState ? this.game.gfx.black : TEXT_COLOR);
        x += cw;
        x += this.game.gfx.drawText(this.prompt.after, x, _y, TEXT_COLOR);
      }

      var y = 13;
      for (var i = Math.max(0, this._log.length - Math.floor(500 / 14)); i < this._log.length; i++) {
        if (this.dropdownY + 500 > y) {
          this.game.gfx.drawText(this._log[i].msg, 2, y, this.logColors[this._log[i].mode]);
          y += 14;
        }
      }
    }
  }]);

  return Debug;
})();

var InputManager = (function () {
  function InputManager(elem, debug) {
    var _this11 = this;

    _classCallCheck(this, InputManager);

    this.dbg = debug;
    this.element = elem;
    this._lastInput = [];
    this._betweenInput = [];
    this._input = [];
    this._keys = [];
    this._keymap = {};

    this.up = new Key(this, ["ArrowUp", "KeyW"]);
    this.left = new Key(this, ["ArrowLeft", "KeyA"]);
    this.down = new Key(this, ["ArrowDown", "KeyS"]);
    this.right = new Key(this, ["ArrowRight", "KeyD"]);

    document.addEventListener("keydown", function (e) {
      if (e.code == "Backquote") {
        _this11.dbg.active = !_this11.dbg.active;
      } else if (_this11.dbg.active) {
        _this11.dbg.key(e);
      } else if (_this11._keymap[e.code]) {
        _this11._betweenInput[_this11._keymap[e.code]] = true;
      }
    });

    document.addEventListener("keyup", function (e) {
      if (!_this11.dbg.active && _this11._keymap[e.code]) {
        _this11._betweenInput[_this11._keymap[e.code]] = false;
      }
    });
  }

  _createClass(InputManager, [{
    key: "beginFrame",
    value: function beginFrame() {
      for (var k in this._input) {
        this._lastInput[k] = this._input[k];
      }
      for (var k in this._betweenInput) {
        this._input[k] = this._betweenInput[k];
      }
    }
  }]);

  return InputManager;
})();

var Key = (function () {
  function Key(input, keys) {
    _classCallCheck(this, Key);

    this.input = input;
    this.id = input._keys.length;
    for (var k in keys) {
      input._keymap[keys[k]] = this.id;
    }
    input._keys.push(this);
  }

  _createClass(Key, [{
    key: "pressed",
    value: function pressed() {
      return this.input._input[this.id];
    }
  }, {
    key: "justPressed",
    value: function justPressed() {
      return this.input._input[this.id] && !this.input._lastInput[this.id];
    }
  }, {
    key: "justReleased",
    value: function justReleased() {
      return this.input._input[this.id] && !this.input._lastInput[this.id];
    }
  }]);

  return Key;
})();

var Game = (function () {
  function Game(canvas) {
    _classCallCheck(this, Game);

    this.dbg = new Debug(this);
    this.gfx = new GFXCore(this, canvas);
    this.sfx = new SFXCore(this);
    this.input = new InputManager(canvas, this.dbg);
    this.resourceManager = new ResourceManager(this.dbg.out("ResourceManager"));
    this.assetManager = new AssetManager(this.resourceManager, this.dbg.out("AssetManager"));
    this.assetManager.addLoader("image", this.gfx.imageLoader());
    this.assetManager.addLoader("sound", this.sfx.soundLoader());
    this.state = new LoaderState(this, this.resourceManager, this.assetManager);

    this.realtime = {};
    this.realtime.now = performance.now();
    this.realtime.delta = 0;
    this.gametime = {};
    this.gametime.now = 0;
    this.gametime.delta = 0;
    this.gametime.factor = 1;

    window.requestAnimationFrame(this.chainrender);
  }

  _createClass(Game, [{
    key: "chainrender",
    value: function chainrender(timestamp) {
      window.theGame.render(timestamp);
    }
  }, {
    key: "render",
    value: function render(timestamp) {
      // Update Times
      this.realtime.delta = timestamp - this.realtime.now;
      this.realtime.now = timestamp;
      this.gametime.delta = this.realtime.delta * this.gametime.factor;
      this.gametime.now += this.gametime.delta;

      this.gfx.resize(); //make sure we're the correct size
      this.gfx.clearScreen(this.gfx.black);
      this.input.beginFrame();
      this.state.render();
      this.dbg.render();

      window.requestAnimationFrame(this.chainrender);
    }
  }]);

  return Game;
})();

window.addEventListener("load", function () {
  var game = window.theGame = new Game(document.getElementById("canvas"));
});