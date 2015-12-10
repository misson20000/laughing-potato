import {Camera} from "../camera.js";
import {ResourceDownloader} from "../resourcemanager.js";
import {PlayState} from "./play.js"

export class LoaderState {
  constructor(game, resmgr, assetmgr) {
    this.resmgr = resmgr;
    this.assetmgr = assetmgr;
    this.game = game;
    this.dl = new ResourceDownloader();

    this.status = "Disovering assets...";
    
    this.camera = new Camera();
    
    this.resmgr.addResourceProvider(0, this.dl);
    this.resmgr.queue("assets.map").then((resource) => {
      return new Promise((resolve, reject) => {
        let fileReader = new FileReader();
        fileReader.onload = () => {
          resolve(JSON.parse(fileReader.result));
        };
        fileReader.readAsText(resource.blob);
      });
    }).then((assetMap) => {
      let promises = [];
      for(let asset in assetMap) {
        promises.push(
          this.resmgr.queue(assetMap[asset].url).then((resource) => {
            return this.assetmgr.load(resource, assetMap[asset].type, assetMap[asset].asset);
          })
        );
      }
      this.status = "Downloading assets...";
      this.resmgr.flush();
      Promise.all(promises).then(() => {
        this.game.state = new PlayState(this.game);
      });
    });

    this.resmgr.flush();
  }

  render() {
    this.game.gfx.lookThrough(this.camera);
    let color;
    if(this.resmgr.status == "idle") { color = this.game.gfx.green; }
    if(this.resmgr.status == "failed") { color = this.game.gfx.red; }
    if(this.resmgr.status == "loading") { color = this.game.gfx.blue; }
    this.game.gfx.fillRect({x: -50, y: -50, w: 100, h: 100}, color);
  }
}
