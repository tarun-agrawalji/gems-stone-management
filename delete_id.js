const fs = require("fs");
const path = require("path");

const targetObj = path.join(__dirname, "app", "api", "rejection", "[id]");

try {
  console.log("Testing access to:", targetObj);
  if (fs.existsSync(targetObj)) {
    console.log("Exists!");
    fs.rmSync(targetObj, { recursive: true, force: true });
    console.log("Deleted successfully!");
  } else {
    console.log("Does not exist.");
  }
} catch (error) {
  console.error("Failed to delete:", error.message);
}
