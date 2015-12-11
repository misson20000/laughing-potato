import {blobToXML} from "./util.js";

export class Tmx {
  constructor(doc, assetMgr) {
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
    this.height = parseInt(root.getAttribtue("height"));
    this.tilewidth  = parseInt(root.getAttribute("tilewidth"));
    this.tileheight = parseInt(root.getAttribute("tileheight"));
    // ignore background color and render order

    this.tilesets = [];

    let parseFunctions = {
      tileset: (e) => {
        let firstgid = parseInt(e.getAttribute("first"));
        if(e.hasAttribute("source")) {
          this.promises.push(assetMgr.resourceManager.queue(e.getAttribute("source")).then((res) => {
            
          });
        }
      }
    };
    
    root.children.forEach((child) => {
      
    });
  }
}

export let TmxLoader = {
  load: function(res, assetMgr) {
    return blobToXML(res.blob).then((doc) => {
      let tmx = new Tmx(doc, assetMgr);
      return Promise.all(tmx.assets.map((asset) => assetMgr.promiseAsset(asset))).then(() => {
        tmx.hasAssets();
        return tmx;
      });
    });
  }
}
