const { async: AsyncStreamZip } = require("node-stream-zip");
const {
  basename: resolveBaseName,
  relative: resolveRelativePath,
  resolve: resolvePath,
} = require("path");
const Archiver = require("archiver");
const fs = require("fs");

const { lstat, access, mkdir } = fs.promises;

const ARCHIVER_ZIP_FORMAT = "zip";
const MATCH_ALL_PATH = "**/*";

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function validatePaths(...paths) {
  return Promise.all(
    paths.map(async (path) => {
      if (!await pathExists(path)) {
        throw new Error(`Path ${path} does not exist!`);
      }
    }),
  );
}

async function unzipArchive({ archivePath, destinationPath }) {
  const streamZipInstance = new AsyncStreamZip({ file: archivePath });

  await mkdir(destinationPath);
  return streamZipInstance.extract(null, destinationPath);
}

async function createZipArchive({ archivePath, ignoredPaths, targetPaths }) {
  const archiver = new Archiver(ARCHIVER_ZIP_FORMAT, {
    zlib: { level: 9 },
  });

  const outputStream = fs.createWriteStream(archivePath);
  archiver.pipe(outputStream);

  const addPathPromises = targetPaths.map(
    (path) => addPathToArchiver({ archiver, path, ignoredPaths }),
  );
  await Promise.all(addPathPromises);

  await archiver.finalize();
  return new Promise((resolve, reject) => {
    outputStream.on("finish", resolve);
    outputStream.on("error", reject);
  });
}

async function addPathToArchiver({ archiver, path, ignoredPaths }) {
  const pathStat = await lstat(path);
  const baseName = resolveBaseName(path);

  if (pathStat.isDirectory()) {
    archiver.glob(MATCH_ALL_PATH, {
      ignore: await resolveIgnoredPaths(path, ignoredPaths),
      cwd: path,
    }, {
      prefix: baseName,
    });
  } else {
    archiver.file(path, { name: baseName });
  }
}

async function resolveIgnoredPaths(rootPath, paths) {
  // Map all paths to be relative to the root path
  // and filter out the paths that are not in the
  // root path
  const filteredRelativePaths = paths
    .map((path) => resolveRelativePath(rootPath, path))
    .filter((path) => !path.startsWith(".."));

  // If the ignored path is a directory, additionally
  // add the path which matches all files and subdirectories
  const resolvedPathPromises = filteredRelativePaths.map(async (path) => {
    const pathStat = await lstat(resolvePath(rootPath, path));
    return pathStat.isDirectory() ? [`${path}/${MATCH_ALL_PATH}`, path] : path;
  });

  const resolvedPaths = await Promise.all(resolvedPathPromises);
  return resolvedPaths.flat();
}

module.exports = {
  pathExists,
  validatePaths,
  createZipArchive,
  unzipArchive,
};
