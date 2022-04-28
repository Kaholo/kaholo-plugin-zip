const fs = require("fs");
const StreamZip = require("node-stream-zip");
const Archiver = require("./archiver");

async function zip(action) {
  const pathToArchive = action.params.ARCHIVEPATH;
  const pathToTargets = action.params.TARGETS;

  const archiver = new Archiver(pathToArchive);

  const targetsArray = pathToTargets.split("\n");
  for (let i = 0; i < targetsArray.length; i += 1) {
    archiver.add(targetsArray[i]);
  }

  return archiver.finalize();
}

async function zipDir(action) {
  const pathToArchive = action.params.zipPath;
  const pathToDir = action.params.dirPath;
  const ignore = (action.params.ignore || "").split("\n");

  const archiver = new Archiver(pathToArchive);
  archiver.addGlob("**/*", { cwd: pathToDir, ignore });
  return archiver.finalize();
}

function unzip(action) {
  return new Promise((resolve, reject) => {
    const pathToArchive = action.params.ARCHIVE;
    const pathToUnZip = action.params.DESTPATH;
    const streamZip = new StreamZip({
      file: pathToArchive,
      storeEntries: true,
    });
    streamZip.on("ready", () => {
      fs.mkdirSync(pathToUnZip);
      streamZip.extract(null, pathToUnZip, (err, count) => {
        if (err) {
          return reject(err);
        }
        streamZip.close();
        return resolve(`${count} files restored`);
      });
    });
  });
}

module.exports = {
  zip,
  zipDir,
  unzip,
};
