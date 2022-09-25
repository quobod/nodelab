/* 
    Library for storing and editing data
 */

// Dependencies
const fs = require("fs");
const path = require("path");
const utils = require("../Utils");

// Container for the module
const lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");

// Write data to a file
lib.create = (directory, filename, data, callback) => {
  // Open the file for writing
  try {
    fs.open(
      lib.baseDir + directory + "/" + filename + ".json",
      "wx",
      (err, fileDesc) => {
        if (!err && fileDesc) {
          // Convert data to string
          const stringData = utils.stringify(data);

          // Write to file and close it
          fs.writeFile(fileDesc, stringData, (err) => {
            if (!err) {
              fs.close(fileDesc, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback("Error closing new file");
                }
              });
            } else {
              callback("Error writing to new file");
            }
          });
        } else {
          callback(
            `Could not create new file: ${lib.baseDir}${directory}/${filename}.json. It may already exists.`
          );
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

// Read data from a file
lib.read = (directory, filename, callback) => {
  fs.readFile(
    lib.baseDir + directory + "/" + filename + ".json",
    "utf8",
    (err, data) => {
      callback(err, data);
    }
  );
};

// Update data inside a file
lib.update = (directory, filename, data, callback) => {
  fs.open(
    lib.baseDir + directory + "/" + filename + ".json",
    "r+",
    (err, fileDesc) => {
      if (!err && fileDesc) {
        // Convert data to string
        const stringData = utils.stringify(data);

        // Truncate the file
        fs.ftruncate(fileDesc, (err) => {
          if (!err) {
            fs.writeFile(fileDesc, stringData, (err) => {
              if (!err) {
                fs.close(fileDesc, (err) => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback(
                      `Error closing new file: ${lib.baseDir}/${directory}/${filename}.json\n`
                    );
                  }
                });
              }
            });
          } else {
            callback(
              `Error truncating file: ${lib.baseDir}/${directory}/${filename}.json`
            );
          }
        });
      }
    }
  );
};

// Delete a file
lib.delete = (directory, filename, callback) => {
  fs.unlink(lib.baseDir + directory + "/" + filename + ".json", (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("");
    }
  });
};

// Export the module
module.exports = lib;
