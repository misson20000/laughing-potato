export class FilePromiseReader {
  constructor(file) {
    this.reader = new FileReader();
    this.file = file;
  }

  arrayBuffer() {
    return new Promise((resolve, reject) => {
      this.reader.onload = () => {
        resolve(this.reader.result);
      };
      this.reader.onerror = () => {
        reject(this.reader.error);
      };
      this.reader.readAsArrayBuffer(this.file);
    });
  }

  text() {
    return new Promise((resolve, reject) => {
      this.reader.onload = () => {
        resolve(this.reader.result);
      };
      this.reader.onerror = () => {
        reject(this.reader.error);
      };
      this.reader.readAsText(this.file);
    });
  }
}

export class JSONAssertions {
  constructor(obj) {
    this.obj = obj;
  }
  isObject(v) {
    if(!v || typeof(v) != "object") {
      throw (v + " is not an object (it's a " + typeof(v) + ")");
    }
  }
  isNumber(v) {
    if((!v && v != 0) || typeof(v) != "number") {
      throw (v + " is not a number (it's a " + typeof(v) + ")");
    }
  }
  isArray(v) {
    if(!v || !Array.isArray(v)) {
      throw (v + " is not an array (it's a " + typeof(v) + ")");
    }
  }
}

export let blobToXML = (blob) => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.responseXML);
    xhr.onerror = reject;
    xhr.open("GET", URL.createObjectURL(blob));
    xhr.responseType = "document";
    xhr.send();
  });
}
