const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

class Archiver {
  promise;

  constructor(pathToArchive) {
    const output = fs.createWriteStream(pathToArchive);
    this.archiver = archiver("zip", { zlib: { level: 9 } });
    this.archiver.pipe(output);
    this.promise = new Promise((resolve, reject) => {
      this.archiver.on("error", (err) => {
        reject(err);
      });
      output.on("finish", () => resolve({
        filePath: pathToArchive,
        fileSize: this.archiver.pointer(),
      }));
    });
  }

  add(filePath, destPath = false) {
    if (fs.lstatSync(filePath).isFile()) {
      this.addFile(filePath);
    } else {
      this.addDirectory(filePath, destPath);
    }
  }

  addFile(filePath) {
    this.archiver = this.archiver.append(fs.createReadStream(filePath), {
      name: path.basename(filePath),
    });
  }

  addDirectory(dirPath, destpath = false) {
    this.archiver = this.archiver.directory(dirPath, destpath);
  }

  addGlob(pattern, { cwd, ignore = [] }) {
    this.archiver = this.archiver.glob(pattern, {
      cwd,
      ignore,
    });
  }

  finalize() {
    this.archiver.finalize();
    return this.promise;
  }
}

module.exports = Archiver;
