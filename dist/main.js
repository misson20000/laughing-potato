"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AssetManager = (function () {
  function AssetManager(resourceManager, dbg) {
    _classCallCheck(this, AssetManager);

    this.resourceManager = resourceManager;
    this.dbg = dbg;
    this.assets = {};
    this.directAssets = {};
    this.assetPromises = {};
    this.loaders = {};
    this.assetList = [];

    var dataLoader = undefined;
    this.addLoader("data", dataLoader = { load: function load(res, mgr, opt) {
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
    value: function load(resource, via, target, parameters) {
      var _this2 = this;

      var o = this.assets;
      var a = target.split(".");
      var i = 0;
      this.dbg.log("loading " + target + " via " + via);
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
      asset.promise = this.loaders[via].load(resource, this, parameters).then(function (dat) {
        asset.data = dat;
        _this2.dbg.log(target + " promise resolved");
        return asset;
      }, function (reason) {
        _this2.dbg.log(target + " promise rejected because " + reason);
      });

      if (this.assetPromises[target]) {
        asset.promise.then(this.assetPromises[target].resolve, this.assetPromises[target].reject);
      }

      return asset.promise;
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
  }, {
    key: "text",
    value: function text() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.reader.onload = function () {
          resolve(_this4.reader.result);
        };
        _this4.reader.onerror = function () {
          reject(_this4.reader.error);
        };
        _this4.reader.readAsText(_this4.file);
      });
    }
  }]);

  return FilePromiseReader;
})();

var JSONAssertions = (function () {
  function JSONAssertions(obj) {
    _classCallCheck(this, JSONAssertions);

    this.obj = obj;
  }

  _createClass(JSONAssertions, [{
    key: "isObject",
    value: function isObject(v) {
      if (!v || (typeof v === "undefined" ? "undefined" : _typeof(v)) != "object") {
        throw v + " is not an object (it's a " + (typeof v === "undefined" ? "undefined" : _typeof(v)) + ")";
      }
    }
  }, {
    key: "isNumber",
    value: function isNumber(v) {
      if (!v && v != 0 || typeof v != "number") {
        throw v + " is not a number (it's a " + (typeof v === "undefined" ? "undefined" : _typeof(v)) + ")";
      }
    }
  }, {
    key: "isArray",
    value: function isArray(v) {
      if (!v || !Array.isArray(v)) {
        throw v + " is not an array (it's a " + (typeof v === "undefined" ? "undefined" : _typeof(v)) + ")";
      }
    }
  }]);

  return JSONAssertions;
})();

var blobToXML = function blobToXML(blob) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.responseXML != null) {
        resolve(xhr.responseXML);
      } else {
        resolve(new FilePromiseReader(blob).text().then(function (txt) {
          return new DOMParser().parseFromString(txt, "application/xml");
        })); // try another way
      }
    };
    xhr.onerror = reject;
    xhr.open("GET", URL.createObjectURL(blob));
    xhr.responseType = "document";
    xhr.send();
  });
};

var b64toArrayBuffer = function b64toArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

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

    this.img = { data: canvas };

    this.ctx.save();
  }

  _createClass(GFXCore, [{
    key: "getImage",
    value: function getImage() {
      return this.img;
    }
  }, {
    key: "resize",
    value: function resize() {
      var pw = this.width;
      var ph = this.height;
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      if (this.currentCamera) {
        this.lookThrough(this.currentCamera);
      }
      if (this.game) {
        if ((pw != this.width || ph != this.height) && this.game.state && this.game.state.resize) {
          this.game.state.resize();
        }
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
    key: "drawSubImage",
    value: function drawSubImage(img, x, y, sx, sy, sw, sh) {
      this.ctx.mozImageSmoothingEnabled = false;
      this.ctx.webkitImageSmoothingEnabled = false;
      this.ctx.msImageSmoothingEnabled = false;
      this.ctx.imageSmoothingEnabled = false;

      this.ctx.drawImage(img.data, sx, sy, sw, sh, x, y, sw, sh);
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
      var loader = { load: function load(res, mgr, opt) {
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
  }, {
    key: "spriteLoader",
    value: function spriteLoader() {
      var loader = { load: function load(res, mgr, opt) {
          return new FilePromiseReader(res.blob).text().then(function (txt) {
            return JSON.parse(txt);
          }).then(function (json) {
            return mgr.promiseAsset(opt.image).then(function (img) {
              return [img, json];
            });
          }).then(function (arr) {
            var img = arr[0];
            var json = arr[1];
            var a = new JSONAssertions(json);
            a.isObject(json.bbox);
            a.isNumber(json.bbox.x);
            a.isNumber(json.bbox.y);
            a.isNumber(json.bbox.w);
            a.isNumber(json.bbox.h);

            a.isObject(json.size);
            a.isNumber(json.size.w);
            a.isNumber(json.size.h);

            var s = new Sprite(img, json.size.w, json.size.h, json.bbox.x, json.bbox.y, json.bbox.w, json.bbox.h);
            a.isArray(json.frames);
            json.frames.forEach(function (frame) {
              a.isObject(frame);
              a.isObject(frame.source);
              a.isNumber(frame.source.x);
              a.isNumber(frame.source.y);
              var sx = frame.source.x;
              var sy = frame.source.y;
              var ax = undefined,
                  ay = undefined;
              if (frame.action_point) {
                a.isObject(frame.action_point);
                a.isNumber(frame.action_point.x);
                a.isNumber(frame.action_point.y);
                ax = frame.action_point.x;
                ay = frame.action_point.y;
              }
              s.addFrame(sx, sy, ax, ay);
            });

            a.isObject(json.animations);

            var _loop = function _loop(name) {
              var aj = json.animations[name];
              a.isArray(aj);
              var anim = new Animation();
              aj.forEach(function (instruction) {
                a.isObject(instruction);
                if (instruction.frame != undefined) {
                  a.isNumber(instruction.frame);
                  var frame = instruction.frame;
                  var length = undefined;
                  if (instruction.length) {
                    a.isNumber(instruction.length);
                    length = instruction.length;
                  }
                  anim.addInstruction("frame", frame, length);
                } else if (instruction.loop != undefined) {
                  a.isNumber(instruction.loop);
                  anim.addInstruction("loop", instruction.loop);
                } else {
                  throw "invalid instruction";
                }
              });
              s.addAnimation(name, anim);
            };

            for (var name in json.animations) {
              _loop(name);
            };

            return s;
          });
        } };
      return loader;
    }
  }], [{
    key: "createBuffer",
    value: function createBuffer(w, h) {
      var c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      var gfx = new GFXCore(null, c);
      gfx.width = w;
      gfx.height = h;
      return gfx;
    }
  }]);

  return GFXCore;
})();

var Sprite = (function () {
  function Sprite(asset, w, h, bx, by, bw, bh) {
    _classCallCheck(this, Sprite);

    this.image = asset;
    this.w = w;
    this.h = h;
    this.bx = bx;
    this.by = by;
    this.bw = bw;
    this.bh = bh;

    this.frames = [];
    this.animations = {};
  }

  _createClass(Sprite, [{
    key: "addFrame",
    value: function addFrame(sx, sy, ax, ay) {
      this.frames.push({ sx: sx, sy: sy, ax: ax, ay: ay });
    }
  }, {
    key: "addAnimation",
    value: function addAnimation(name, anim) {
      this.animations[name] = anim;
    }
  }]);

  return Sprite;
})();

var Animation = (function () {
  function Animation() {
    _classCallCheck(this, Animation);

    this.instructions = [];
  }

  _createClass(Animation, [{
    key: "addInstruction",
    value: function addInstruction(type, frame) {
      var length = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      this.instructions.push({ type: type, frame: frame, length: length });
    }
  }]);

  return Animation;
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
      var _this5 = this;

      var loader = { load: function load(res, mgr, opt) {
          return new FilePromiseReader(res.blob).arrayBuffer().then(function (ab) {
            return _this5.ctx.decodeAudioData(ab);
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
      var _this6 = this;

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
        // success
        _this6.dbg.log("success");
        var fin = new Resource(job.url, resource);
        _this6.resources[job.url] = fin;
        job.resolve(fin);
        _this6._queue.shift();
        if (_this6._queue.length > 0) {
          _this6._tryDL(_this6._queue[0], 0);
        } else {
          _this6.dbg.log("finished queue");
          _this6.status = "idle";
          return;
        }
      }, function (reason) {
        // failiure
        _this6.dbg.log("failiure, trying next provider");
        _this6._tryDL(job, providerNum + 1);
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
      var _this7 = this;

      this.status = "loading";
      return new Promise(function (resolve, reject) {
        _this7._tryDL({ url: resource, resolve: resolve, reject: reject }, 0);
      });
    }
  }, {
    key: "queue",
    value: function queue(resource) {
      var _this8 = this;

      if (!this.resources[resource]) {
        var _ret2 = (function () {
          var self = _this8;
          _this8.dbg.log("Queued " + resource);
          return {
            v: new Promise(function (resolve, reject) {
              self._queue.push({ url: resource, resolve: resolve, reject: reject });
            })
          };
        })();

        if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
      } else {
        return new Promise(function (resolve, reject) {
          resolve(_this8.resources[resource]);
        });
      }
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
            resolve(response.blob());
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

// let SKY_COLOR = new Color(128, 128, 255); // day time

var SKY_COLOR = new Color(16, 0, 32); // night time

var PlayState = (function () {
  function PlayState(game) {
    _classCallCheck(this, PlayState);

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
  }

  _createClass(PlayState, [{
    key: "render",
    value: function render() {
      this.game.gfx.lookThrough(this.camera);
      this.game.gfx.clearScreen(SKY_COLOR);

      this.game.gfx.drawImage(this.assets.object.moon, 70, -70);
      this.map.data.drawMap(this.game.gfx);
      this.player.a.render(this.game.gfx, this.player.x, this.player.y);
      this.player.a.play("walk");
      this.player.a.run(this.game.gametime.delta);
    }
  }]);

  return PlayState;
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

      var _loop2 = function _loop2(asset) {
        promises.push(_this9.resmgr.queue(assetMap[asset].url).then(function (resource) {
          return _this9.assetmgr.load(resource, assetMap[asset].type, assetMap[asset].asset, assetMap[asset]);
        }));
      };

      for (var asset in assetMap) {
        _loop2(asset);
      }
      _this9.status = "Downloading assets...";
      _this9.resmgr.flush();
      Promise.all(promises).then(function () {
        _this9.game.state = new PlayState(_this9.game);
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
      play: PlayState
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

var kc = function kc(e) {
  if (e.code) {
    return e.code;
  }
  switch (e.which) {
    case 37:
      return "ArrowLeft";
    case 38:
      return "ArrowUp";
    case 39:
      return "ArrowRight";
    case 40:
      return "ArrowDown";
    case 87:
      return "KeyW";
    case 65:
      return "KeyA";
    case 83:
      return "KeyS";
    case 68:
      return "KeyD";
    case 192:
      return "Backquote";
    default:
      return "Unknown";
  }
};

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
      if (kc(e) == "Backquote") {
        _this11.dbg.active = !_this11.dbg.active;
      } else if (_this11.dbg.active) {
        _this11.dbg.key(e);
      } else if (_this11._keymap[kc(e)]) {
        _this11._betweenInput[_this11._keymap[kc(e)]] = true;
      }
    });

    document.addEventListener("keyup", function (e) {
      if (!_this11.dbg.active && _this11._keymap[kc(e)]) {
        _this11._betweenInput[_this11._keymap[kc(e)]] = false;
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

var Tmx = (function () {
  function Tmx(doc, assetMgr) {
    var _this12 = this;

    _classCallCheck(this, Tmx);

    this.assetMgr = assetMgr;
    this.promises = [];
    var root = this.root = doc.documentElement;
    if (root.tagName != "map") {
      throw "TMX root tag name is not 'map'";
    }
    if (root.getAttribute("version") != "1.0") {
      throw "Unsupported TMX version '" + root.getAttribute("version") + "'";
    }
    if (root.getAttribute("orientation") != "orthogonal") {
      throw "Unsupported TMX orientation '" + root.getAttribute("orientation") + "'";
    }
    this.width = parseInt(root.getAttribute("width"));
    this.height = parseInt(root.getAttribute("height"));
    this.tilewidth = parseInt(root.getAttribute("tilewidth"));
    this.tileheight = parseInt(root.getAttribute("tileheight"));
    // ignore background color and render order

    this.tilesets = [];
    this.properties = {};
    this.tileLayers = [];
    this.objectLayers = [];

    var map = this;

    var parseFunctions = {
      tileset: function tileset(e) {
        var firstgid = parseInt(e.getAttribute("firstgid"));
        if (e.hasAttribute("source")) {
          map.promises.push(assetMgr.resourceManager.queue(e.getAttribute("source")).then(function (res) {
            return blobToXML(res.blob);
          }).then(function (xml) {
            map.tilesets.push(new TmxTileset(xml.documentElement, firstgid, _this12));
          }));
        } else {
          map.tilesets.push(new TmxTileset(e, firstgid, _this12));
        }
      },
      layer: function layer(e) {
        map.tileLayers.push(new TmxLayer(e, _this12));
      },
      objectgroup: function objectgroup(e) {
        map.objectLayers.push(new TmxObjectLayer(e));
      },
      properties: function properties(e) {
        map.properties = new TmxProperties(e);
      }
    };

    for (var i = 0; i < root.children.length; i++) {
      var child = root.children[i];
      if (!parseFunctions[child.tagName]) {
        throw "Invalid element '<" + child.tagName + ">' under <map>";
      }
      parseFunctions[child.tagName](child);
    };
  }

  _createClass(Tmx, [{
    key: "drawTile",
    value: function drawTile(gfx, tile, x, y) {
      var tsi = 0;
      for (var i = 0; i < this.tilesets.length; i++) {
        if (this.tilesets[i].firstgid <= tile) {
          tsi = i;
        } else {
          break;
        }
      }

      var ts = this.tilesets[tsi];

      gfx.drawSubImage(ts.image, x, y, ts.getX(tile - ts.firstgid), ts.getY(tile - ts.firstgid), ts.tilewidth, ts.tileheight);
    }
  }, {
    key: "drawMap",
    value: function drawMap(gfx) {
      for (var l = 0; l < this.tileLayers.length; l++) {
        gfx.drawImage(this.tileLayers[l].image, 0, 0);
      }
    }
  }, {
    key: "drawMapDirectly",
    value: function drawMapDirectly(gfx) {
      for (var l = 0; l < this.tileLayers.length; l++) {
        this.tileLayers[l].render(gfx);
      }
    }
  }, {
    key: "hasAssets",
    value: function hasAssets() {
      this.tileLayers.forEach(function (l) {
        l.bake();
      });
    }
  }]);

  return Tmx;
})();

var TmxTileset = (function () {
  function TmxTileset(e, firstgid, map) {
    var _this13 = this;

    _classCallCheck(this, TmxTileset);

    this.firstgid = firstgid;
    if (!e.hasAttribute("name")) {
      throw "Tileset has no name";
    }
    if (!e.hasAttribute("tilewidth")) {
      throw "Tileset has no tile width attribute";
    }
    if (!e.hasAttribute("tileheight")) {
      throw "Tileset has no tile height attribute";
    }
    if (!e.hasAttribute("tilecount")) {
      throw "Tileset has no tile count attribute";
    }

    var spacing = 0,
        margin = 0;
    if (e.hasAttribute("spacing")) {
      this.spacing = parseInt(e.getAttribute("spacing"));
    }
    if (e.hasAttribute("margin")) {
      this.margin = parseInt(e.getAttribute("margin"));
    }

    this.name = e.getAttribute("name");
    this.tilewidth = parseInt(e.getAttribute("tilewidth"));
    this.tileheight = parseInt(e.getAttribute("tileheight"));
    this.tilecount = parseInt(e.getAttribute("tilecount"));

    this.properties = {};

    for (var i = 0; i < e.children.length; i++) {
      var child = e.children[i];
      if (child.tagName == "properties") {
        this.properties = new TmxProperties(child);
      } else if (child.tagName == "image") {//ignore
      } else {
          throw "Unsupported tileset child '< " + child.tagName + ">'";
        }
    }

    if (!this.properties.asset) {
      throw "Tileset nas no asset property";
    }
    console.log("adding promise for '" + this.properties.asset + "'");
    map.promises.push(map.assetMgr.promiseAsset(this.properties.asset).then(function (asset) {
      _this13.image = asset;
    }));
  }

  _createClass(TmxTileset, [{
    key: "getX",
    value: function getX(tile) {
      return tile * this.tilewidth % this.image.data.width;
    }
  }, {
    key: "getY",
    value: function getY(tile) {
      return Math.floor(tile / (this.image.data.width / this.tilewidth)) * this.tileheight;
    }
  }]);

  return TmxTileset;
})();

var TmxLayer = (function () {
  function TmxLayer(e, map) {
    _classCallCheck(this, TmxLayer);

    this.map = map;

    if (!e.hasAttribute("name")) {
      throw "Layer has no name attribute";
    }

    this.properties = {};

    for (var i = 0; i < e.children.length; i++) {
      var c = e.children[i];
      if (c.tagName == "properties") {
        this.properties = new TmxProperties(c);
      } else if (c.tagName == "data") {
        if (!c.hasAttribute("encoding") || c.getAttribute("encoding") != "base64") {
          throw "Unsupported encoding (try uncompressed base64)";
        }
        if (c.hasAttribute("compression")) {
          throw "Unsupported compression (try uncompressed base64)";
        }

        var ab = b64toArrayBuffer(c.innerHTML);
        this.tiles = new Uint32Array(ab);
      } else {
        throw "Invalid tag '<" + c.tagName + ">' under <layer>";
      }
    }
  }

  _createClass(TmxLayer, [{
    key: "bake",
    value: function bake() {
      var buffer = GFXCore.createBuffer(this.map.width * this.map.tilewidth, this.map.height * this.map.tileheight);
      this.render(buffer);
      this.image = buffer.getImage();
    }
  }, {
    key: "render",
    value: function render(gfx) {
      var i = 0;
      var d = this.tiles;
      for (var y = 0; y < this.map.height; y++) {
        for (var x = 0; x < this.map.width; x++) {
          if (d[i] != 0) {
            this.map.drawTile(gfx, d[i], x * this.map.tilewidth, y * this.map.tileheight);
          }
          i++;
        }
      }
    }
  }]);

  return TmxLayer;
})();

var TmxObjectLayer = function TmxObjectLayer(e) {
  _classCallCheck(this, TmxObjectLayer);

  if (!e.hasAttribute("name")) {
    throw "object layer has no name";
  }
  this.name = e.getAttribute("name");
  this.properties = {};
  this.objects = [];
  for (var i = 0; i < e.children.length; i++) {
    var c = e.children[i];
    if (c.tagName == "properties") {
      this.properties = new TmxProperties(c);
    } else if (c.tagName == "object") {
      this.objects.push(new TmxObject(c));
    } else {
      throw "invalid tag '<" + c.tagName + ">' in object layer";
    }
  }
};

var TmxObject = function TmxObject(e) {
  _classCallCheck(this, TmxObject);

  if (!e.hasAttribute("id")) {
    throw "object with no id";
  }
  if (!e.hasAttribute("type")) {
    throw "object with no type";
  }
  if (!e.hasAttribute("x")) {
    throw "object with no x";
  }
  if (!e.hasAttribute("y")) {
    throw "object with no y";
  }
  if (!e.hasAttribute("width")) {
    throw "object has no width";
  }
  if (!e.hasAttribute("height")) {
    throw "object has no height";
  }
  this.id = parseInt(e.getAttribute("id"));
  this.type = e.getAttribute("type");
  this.x = parseInt(e.getAttribute("x"));
  this.y = parseInt(e.getAttribute("y"));
  this.width = parseInt(e.getAttribute("width"));
  this.height = parseInt(e.getAttribute("height"));
  this.properties = {};

  for (var i = 0; i < e.children.length; i++) {
    var c = e.children[i];
    if (c.tagName == "properties") {
      this.properties = new TmxProperties(c);
    } else {
      throw "object shape '" + c.tagName + "' is unsupported";
    }
  }
};

var TmxProperties = function TmxProperties(e) {
  _classCallCheck(this, TmxProperties);

  if (e.tagName != "properties") {
    throw "Element is not 'properties'";
  }
  for (var i = 0; i < e.children.length; i++) {
    var p = e.children[i];
    if (p.tagName != "property") {
      throw "Non-<property> tag under <properties>";
    }
    if (!p.hasAttribute("name")) {
      throw "<property> tag has no 'name' attribute";
    }
    var v = undefined;
    if (p.hasAttribute("value")) {
      v = p.getAttribute("value");
    } else {
      v = p.innerHTML;
    }
    this[p.getAttribute("name")] = v;
  };
};

var TmxLoader = {
  load: function load(res, assetMgr) {
    return blobToXML(res.blob).then(function (doc) {
      var tmx = new Tmx(doc, assetMgr);
      return Promise.all(tmx.promises).then(function () {
        tmx.hasAssets();
        return tmx;
      });
    });
  }
};

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
    this.assetManager.addLoader("sprite", this.gfx.spriteLoader());
    this.assetManager.addLoader("sound", this.sfx.soundLoader());
    this.assetManager.addLoader("tmx", TmxLoader);
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