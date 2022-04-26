const { access } = require("fs/promises");

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  pathExists,
};
