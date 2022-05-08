const fs = require("fs/promises");
const path = require("path");
const { bootstrap } = require("kaholo-plugin-library");
const { pathExists, createZipArchive, unzipArchive } = require("./helpers");

async function zip({
  ARCHIVEPATH: archivePath,
  TARGETS: targetPaths,
  ignoredPaths,
  overwrite,
}) {
  const absoluteArchivePath = path.resolve(archivePath);
  const absoluteTargetPaths = targetPaths.map((targetPath) => path.resolve(targetPath));
  const absoluteIgnoredPaths = ignoredPaths.map((ignorePath) => path.resolve(ignorePath));

  if (overwrite && await pathExists(absoluteArchivePath)) {
    await fs.rm(absoluteArchivePath, { recursive: true });
  }

  return createZipArchive({
    archivePath: absoluteArchivePath,
    targetPaths: absoluteTargetPaths,
    ignoredPaths: absoluteIgnoredPaths,
  });
}

async function unzip({
  ARCHIVE: archivePath,
  DESTPATH: destinationPath,
  clearExtractionPath,
}) {
  const absoluteArchivePath = path.resolve(archivePath);
  const absoluteDestinationPath = path.resolve(destinationPath);

  if (clearExtractionPath && await pathExists(absoluteDestinationPath)) {
    await fs.rm(absoluteDestinationPath, { recursive: true });
  }

  return unzipArchive({
    archivePath: absoluteArchivePath,
    destinationPath: absoluteDestinationPath,
  });
}

module.exports = bootstrap({
  zip,
  unzip,
});
