export class Tmx {
  constructor(doc) {
    this.assets = [];
    this.root = doc.documentElement;
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
  }
}

export let TmxLoader = {
  load: function(res, assetMgr) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.responseXML);
      xhr.onerror = reject;
      xhr.open("GET", URL.createObjectURL(res.blob));
      xhr.responseType = "document";
      xhr.send();
    }).then((doc) => {
      let tmx = new Tmx(doc);
      return Promise.all(tmx.assets.map((asset) => assetMgr.promiseAsset(asset))).then(() => tmx);
    });
  }
}
