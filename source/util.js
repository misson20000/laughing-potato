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
}
