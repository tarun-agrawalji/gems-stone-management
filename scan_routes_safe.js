const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "app");
const results = [];
const errors = [];

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const dirPath = path.join(dir, f);
      try {
        if (fs.statSync(dirPath).isDirectory()) {
          const name = f;
          if (name.includes("[") || name.includes("]")) {
            results.push(dirPath.replace(__dirname, ""));
          }
          walkDir(dirPath);
        }
      } catch (e) {
        errors.push(`Error stat ${dirPath}: ${e.message}`);
      }
    }
  } catch (err) {
    errors.push(`Error reading ${dir}: ${err.message}`);
  }
}

walkDir(appDir);

fs.writeFileSync(
  path.join(__dirname, "scan_results.json"),
  JSON.stringify({ results, errors }, null, 2),
);
console.log(
  "Scan complete. Found",
  results.length,
  "dynamic routes. Errors:",
  errors.length,
);
