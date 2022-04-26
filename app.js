const fs = require("fs");
const StreamZip = require("node-stream-zip");
const Archiver = require("./archiver");
const { pathExists } = require("./helpers");

async function zip(action) {
  const pathToArchive = action.params.ARCHIVEPATH;
  const pathToTargets = action.params.TARGETS;

  const archiver = new Archiver(pathToArchive);

  const targetsArray = pathToTargets.split(" ");
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

async function unzip(action) {
  const pathToArchive = action.params.ARCHIVE;
  const pathToUnZip = action.params.DESTPATH;
  if (action.params.clearExtractionPath) {
    if (await pathExists(pathToUnZip)) {
      await fs.promises.rm(pathToUnZip, { recursive: true });
    }
  }
  const streamZip = new StreamZip({
    file: pathToArchive,
    storeEntries: true,
  });
  return new Promise((resolve, reject) => {
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
