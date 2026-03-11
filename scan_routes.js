const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      callback(dirPath);
      walkDir(dirPath, callback);
    }
  });
}

const appDir = path.join(__dirname, "app");
const results = [];
walkDir(appDir, (d) => {
  const name = path.basename(d);
  if (name.includes("[") || name.includes("]")) {
    results.push(d.replace(__dirname, ""));
  }
});
console.log(JSON.stringify(results, null, 2));
