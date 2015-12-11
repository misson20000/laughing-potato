import {GFXCore} from "./gfxcore.js";
import {blobToXML, b64toArrayBuffer} from "./util.js";

export class Tmx {
  constructor(doc, assetMgr) {
    this.assetMgr = assetMgr;
    this.promises = [];
    let root = this.root = doc.documentElement;
    if(root.tagName != "map") {
      throw "TMX root tag name is not 'map'";
    }
    if(root.getAttribute("version") != "1.0") {
      throw "Unsupported TMX version '" + root.getAttribute("version") + "'";
    }
    if(root.getAttribute("orientation") != "orthogonal") {
      throw "Unsupported TMX orientation '" + root.getAttribute("orientation") + "'";
    }
    this.width  = parseInt(root.getAttribute("width"));
    this.height = parseInt(root.getAttribute("height"));
    this.tilewidth  = parseInt(root.getAttribute("tilewidth"));
    this.tileheight = parseInt(root.getAttribute("tileheight"));
    // ignore background color and render order

    this.tilesets = [];
    this.properties = {};
    this.tileLayers = [];
    this.objectLayers = [];
    
    let map = this;
    
    let parseFunctions = {
      tileset: (e) => {
        let firstgid = parseInt(e.getAttribute("firstgid"));
        if(e.hasAttribute("source")) {
          map.promises.push(assetMgr.resourceManager.queue(e.getAttribute("source")).then((res) => {
            return blobToXML(res.blob);
          }).then((xml) => {
            map.tilesets.push(new TmxTileset(xml.documentElement, firstgid, this));
          }));
        } else {
          map.tilesets.push(new TmxTileset(e, firstgid, this));
        }
      },
      layer: (e) => {
        map.tileLayers.push(new TmxLayer(e, this));
      },
      objectgroup: (e) => {
        map.objectLayers.push(new TmxObjectLayer(e));
      },
      properties: (e) => {
        map.properties = new TmxProperties(e);
      }
    };

    for(let i = 0; i < root.children.length; i++) {
      let child = root.children[i];
      if(!parseFunctions[child.tagName]) {
        throw "Invalid element '<" + child.tagName + ">' under <map>";
      }
      parseFunctions[child.tagName](child);
    };
  }

  drawTile(gfx, tile, x, y) {
    let tsi = 0;
    for(let i = 0; i < this.tilesets.length; i++) {
      if(this.tilesets[i].firstgid <= tile) {
        tsi = i;
      } else { break; }
    }

    let ts = this.tilesets[tsi];
    
    gfx.drawSubImage(ts.image, x, y, ts.getX(tile-ts.firstgid), ts.getY(tile-ts.firstgid), ts.tilewidth, ts.tileheight);
  }

  drawMap(gfx) {
    for(let l = 0; l < this.tileLayers.length; l++) {
      gfx.drawImage(this.tileLayers[l].image, 0, 0);
    }
  }
  
  drawMapDirectly(gfx) {
    for(let l = 0; l < this.tileLayers.length; l++) {
      this.tileLayers[l].render(gfx);
    }
  }
  
  hasAssets() {
    this.tileLayers.forEach((l) => {
      l.bake();
    });
  }
}

class TmxTileset {
  constructor(e, firstgid, map) {
    this.firstgid = firstgid;
    if(!e.hasAttribute("name")) {
      throw "Tileset has no name";
    }
    if(!e.hasAttribute("tilewidth")) {
      throw "Tileset has no tile width attribute";
    }
    if(!e.hasAttribute("tileheight")) {
      throw "Tileset has no tile height attribute";
    }
    if(!e.hasAttribute("tilecount")) {
      throw "Tileset has no tile count attribute";
    }
    
    let spacing = 0, margin = 0;
    if(e.hasAttribute("spacing")) {
      this.spacing = parseInt(e.getAttribute("spacing"));
    }
    if(e.hasAttribute("margin")) {
      this.margin = parseInt(e.getAttribute("margin"));
    }
    
    this.name = e.getAttribute("name");
    this.tilewidth = parseInt(e.getAttribute("tilewidth"));
    this.tileheight = parseInt(e.getAttribute("tileheight"));
    this.tilecount = parseInt(e.getAttribute("tilecount"));

    this.properties = {};
    
    for(let i = 0; i < e.children.length; i++) {
      let child = e.children[i];
      if(child.tagName == "properties") {
        this.properties = new TmxProperties(child);
      } else if(child.tagName == "image") { //ignore
      } else{
        throw "Unsupported tileset child '< " + child.tagName + ">'";
      }
    }

    if(!this.properties.asset) {
      throw "Tileset nas no asset property";
    }
    console.log("adding promise for '" + this.properties.asset + "'");
    map.promises.push(map.assetMgr.promiseAsset(this.properties.asset).then((asset) => {
      this.image = asset;
    }));
  }

  getX(tile) {
    return (tile * this.tilewidth) % this.image.data.width;
  }

  getY(tile) {
    return Math.floor(tile/(this.image.data.width/this.tilewidth)) * this.tileheight;
  }
}

class TmxLayer {
  constructor(e, map) {
    this.map = map;
    
    if(!e.hasAttribute("name")) {
      throw "Layer has no name attribute";
    }

    this.properties = {};
    
    for(let i = 0; i < e.children.length; i++) {
      let c = e.children[i];
      if(c.tagName == "properties") {
        this.properties = new TmxProperties(c);
      } else if(c.tagName == "data") {
        if(!c.hasAttribute("encoding") || c.getAttribute("encoding") != "base64") {
          throw "Unsupported encoding (try uncompressed base64)";
        }
        if(c.hasAttribute("compression")) {
          throw "Unsupported compression (try uncompressed base64)";
        }

        let ab = b64toArrayBuffer(c.innerHTML);
        this.tiles = new Uint32Array(ab);
      } else {
        throw "Invalid tag '<" + c.tagName + ">' under <layer>";
      }
    }
  }

  bake() {
    let buffer = GFXCore.createBuffer(this.map.width*this.map.tilewidth, this.map.height*this.map.tileheight);
    this.render(buffer);
    this.image = buffer.getImage();
  }

  render(gfx) {
    let i = 0;
    let d = this.tiles;
    for(let y = 0; y < this.map.height; y++) {
      for(let x = 0; x < this.map.width; x++) {
        if(d[i] != 0) {
          this.map.drawTile(gfx, d[i], x*this.map.tilewidth, y*this.map.tileheight);
        }
        i++;
      }
    }
  }
}

class TmxObjectLayer {
  constructor(e) {
    if(!e.hasAttribute("name")) {
      throw "object layer has no name";
    }
    this.name = e.getAttribute("name");
    this.properties = {};
    this.objects = [];
    for(let i = 0; i < e.children.length; i++) {
      let c = e.children[i];
      if(c.tagName == "properties") {
        this.properties = new TmxProperties(c);
      } else if(c.tagName == "object") {
        this.objects.push(new TmxObject(c));
      } else {
        throw "invalid tag '<" + c.tagName + ">' in object layer";
      }
    }
  }
}

class TmxObject {
  constructor(e) {
    if(!e.hasAttribute("id")) {
      throw "object with no id";
    }
    if(!e.hasAttribute("type")) {
      throw "object with no type";
    }
    if(!e.hasAttribute("x")) {
      throw "object with no x";
    }
    if(!e.hasAttribute("y")) {
      throw "object with no y";
    }
    if(!e.hasAttribute("width")) {
      throw "object has no width";
    }
    if(!e.hasAttribute("height")) {
      throw "object has no height";
    }
    this.id = parseInt(e.getAttribute("id"));
    this.type = e.getAttribute("type");
    this.x = parseInt(e.getAttribute("x"));
    this.y = parseInt(e.getAttribute("y"));
    this.width = parseInt(e.getAttribute("width"));
    this.height = parseInt(e.getAttribute("height"));
    this.properties = {};
    
    for(let i = 0; i < e.children.length; i++) {
      let c = e.children[i];
      if(c.tagName == "properties") {
        this.properties = new TmxProperties(c);
      } else {
        throw "object shape '" + c.tagName + "' is unsupported";
      }
    }
  }
}

class TmxProperties {
  constructor(e) {
    if(e.tagName != "properties") {
      throw "Element is not 'properties'";
    }
    for(let i = 0; i < e.children.length; i++) {
      let p = e.children[i];
      if(p.tagName != "property") {
        throw "Non-<property> tag under <properties>";
      }
      if(!p.hasAttribute("name")) {
        throw "<property> tag has no 'name' attribute";
      }
      let v;
      if(p.hasAttribute("value")) {
        v = p.getAttribute("value");
      } else {
        v = p.innerHTML;
      }
      this[p.getAttribute("name")] = v;
    };
  }
}

export let TmxLoader = {
  load: function(res, assetMgr) {
    return blobToXML(res.blob).then((doc) => {
      let tmx = new Tmx(doc, assetMgr);
      return Promise.all(tmx.promises).then(() => {
        tmx.hasAssets();
        return tmx;
      });
    });
  }
}
