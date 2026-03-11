const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "app", "api", "rejection", "[type]");
const destDir = path.join(__dirname, "app", "api", "rejection-item");
const dest = path.join(destDir, "[type]");

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log("Successfully moved [type] to rejection-item");
  } else {
    console.log("Source [type] does not exist");
  }
} catch (error) {
  console.error("Failed to move:", error.message);
}
