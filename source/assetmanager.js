export class AssetManager {
  constructor(resourceManager, dbg) {
    this.resourceManager = resourceManager;
    this.dbg = dbg;
    this.assets = {};
    this.directAssets = {};
    this.assetPromises = {};
    this.loaders = {};
    this.assetList = [];

    let dataLoader;
    this.addLoader("data", dataLoader = {load: (res, mgr, opt) => {
      return new Promise((resolve, reject) => {
        let fileReader = new FileReader();
        fileReader.onload = () => {
          resolve(fileReader.result);
        };
        fileReader.readAsArrayBuffer(res.blob);
      });
    }});
  }

  addLoader(type, loader) {
    this.loaders[type] = loader;
  }

  promiseAsset(ast) {
    if(this.assetPromises[ast]) {
      return this.assetPromises[ast].promise;
    } else {
      this.assetPromises[ast] = {};
      return this.assetPromises[ast].promise = new Promise((resolve, reject) => {
        this.assetPromises[ast].resolve = resolve;
        this.assetPromises[ast].reject = reject;
        if(this.directAssets[ast]) {
          resolve(this.directAssets[ast]);
        }
      });
    }
  }
  
  load(resource, via, target, parameters, streaming=false) {
    let o = this.assets;
    let a = target.split(".");
    let i = 0;
    this.dbg.log("loading " + target + " via " + via);
    for(i = 0; i < a.length-1; i++) {
      if(o[a[i]] == undefined) {
        this.dbg.log("create " + a[i]);
        o[a[i]] = {};
      }
      this.dbg.log("sub " + a[i]);
      o = o[a[i]];
    }
    this.dbg.log("set " + a[i]);
    let asset = new Asset(null, streaming ? resource : resource.url, this.loaders[via]);
    o[a[i]] = asset;
    this.directAssets[target] = asset;
    this.assetList.push(asset);
    asset.promise = this.loaders[via].load(resource, this, parameters).then((dat) => {
      asset.data = dat;
      this.dbg.log(target + " promise resolved");
      return asset;
    }, (reason) => {
      this.dbg.log(target + " promise rejected because " + reason);
    });

    if(this.assetPromises[target]) {
      asset.promise.then(this.assetPromises[target].resolve,
                         this.assetPromises[target].reject);
    }
    
    return asset.promise;
  }

  reload(asset) {
    this.resourceManager.reload(asset.url).then((res) => {
      return asset.loader.load(res);
    }).then((new_asset) => {
      asset._reload(new_asset);
    });
  }

  reloadAll() {
    for(let a in this.assetList) {
      this.reload(this.assetList[a]);
    }
  }
}

export class Asset {
  constructor(dat, url, loader) {
    this.data = dat;
    this.url = url;
    this.loader = loader;
    this.promise = null;
  }

  reload() {
    theGame.assetManager.reload(this);
  }

  _reload(new_asset) {
    this.data = new_asset.data;
  }
}
