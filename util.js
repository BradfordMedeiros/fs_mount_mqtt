const fse = require('fs-extra');

const fileExists = filepath => {
  try {
    return fse.lstatSync(filepath).isFile();
  } catch(err) {
    return false;
  }
};

const directoryExists = filepath => {
  try {
    return fse.lstatSync(filepath).isDirectory();
  } catch(err) {
    return false;
  }
};

module.exports = {
  fileExists,
  directoryExists,
};