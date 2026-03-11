const fs = require("fs");
const path = require("path");

function removeDir(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log("Successfully removed:", dirPath);
  } catch (err) {
    console.error("Failed to remove:", dirPath, " | Error:", err.message);
  }
}

removeDir(path.join(__dirname, "app", "api", "rejection", "[id]"));
removeDir(path.join(__dirname, "app", "api", "rejection", "[type]"));
