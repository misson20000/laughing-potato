export class ResourceManager {
  constructor(dbg) {
    this.providers = [];
    this._queue = [];
    this.resources = {};
    this.status = "idle";
    this.dbg = dbg;
  }

  addResourceProvider(priority, provider) {
    this.providers.push({priority, provider});
    this.providers.sort((a, b) => {
      if(a[0] < b[0]) { return 1; }
      if(a[0] > b[0]) { return -1; }
      return 0;
    });
  }

  _tryDL(job, providerNum) {
    if(providerNum >= this.providers.length) { //ran out of providers
      this.dbg.log("ran out of providers");
      this.status = "failed";
      job.reject();
      this.failedResource = job.url;
      return;
    }
    this.dbg.log("Trying to load '" + job.url + "' with provider " + providerNum);
    
    this.loading = job.url;
    this.providers[providerNum].provider.provide(job.url, this.dbg).then(
      (resource) => {
        return resource.blob();
      }, (reason) => {
        // failiure
        this.dbg.log("failiure, trying next provider");
        this._tryDL(job, providerNum+1);
      }).then((resource) => {
        // success
        this.dbg.log("success");
        let fin = new Resource(job.url, resource);
        this.resources[job.url] = fin;
        job.resolve(fin);
        this._queue.shift();
        if(this._queue.length > 0) {
          this._tryDL(this._queue[0], 0);
        } else {
          this.dbg.log("finished queue");
          this.status = "idle";
          return;
        }
      });
  }

  flush() {
    this.status = "loading";
    this._tryDL(this._queue[0], 0);
  }

  reload(resource) {
    this.status = "loading";
    return new Promise((resolve, reject) => {
      this._tryDL({url: resource, resolve, reject}, 0);
    });
  }
  
  queue(resource) {
    let self = this;
    this.dbg.log("Queued " + resource);
    return new Promise((resolve, reject) => {
      self._queue.push({url: resource, resolve, reject});
    });
  }
}

export class Resource {
  constructor(url, blob) {
    this.url = url;
    this.blob = blob;
  }
}

export class ResourceDownloader {
  provide(url, dbg) {
    dbg.log("dl " + url);
    return new Promise((resolve, reject) => {
      fetch(url).then((response) => {
        dbg.log("got response");
        if(response.ok) {
          dbg.log("ok, resolving");
          resolve(response);
        } else {
          dbg.log("failed, rejecting");
          reject(response.status + " " + response.statusText);
        }
      }, (fail) => {
        dbg.log("fetch rejected");
        reject(fail);
      });
    });
  }
}
