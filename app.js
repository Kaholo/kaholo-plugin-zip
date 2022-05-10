const fs = require("fs/promises");
const path = require("path");
const { bootstrap } = require("kaholo-plugin-library");
const {
  pathExists,
  createZipArchive,
  unzipArchive,
  validatePaths,
} = require("./helpers");

async function zip({
  ARCHIVEPATH: archivePath,
  TARGETS: targetPaths,
  ignoredPaths,
  overwrite,
}) {
  const absoluteArchivePath = path.resolve(archivePath);
  const absoluteTargetPaths = targetPaths.map((targetPath) => path.resolve(targetPath));
  const absoluteIgnoredPaths = (ignoredPaths || []).map((ignorePath) => path.resolve(ignorePath));
  await validatePaths(...absoluteTargetPaths);

  const archivePathExists = await pathExists(absoluteArchivePath);
  if (overwrite && archivePathExists) {
    await fs.rm(absoluteArchivePath, { recursive: true });
  } else if (!overwrite && archivePathExists) {
    throw new Error(`File ${archivePath} already exists. Please select the "Overwrite Existing Zip Archive" parameter to overwrite.`);
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
  await validatePaths(absoluteArchivePath);

  const destinationPathExists = await pathExists(absoluteDestinationPath);
  if (clearExtractionPath && destinationPathExists) {
    await fs.rm(absoluteDestinationPath, { recursive: true });
  } else if (!clearExtractionPath && destinationPathExists) {
    throw new Error(`Path ${destinationPath} exists. Please select the "Clear Extraction Path" parameter to overwrite.`);
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
