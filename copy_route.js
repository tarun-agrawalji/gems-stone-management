const fs = require("fs");
const path = require("path");

const srcPath = path.join(
  __dirname,
  "app",
  "api",
  "rejection",
  "[type]",
  "[id]",
  "route.bak.ts",
);
const destDir = path.join(
  __dirname,
  "app",
  "api",
  "rejection-item",
  "[type]",
  "[id]",
);
const destPath = path.join(destDir, "route.ts");

try {
  fs.mkdirSync(destDir, { recursive: true });
  console.log("Created directory:", destDir);

  if (fs.existsSync(srcPath)) {
    const content = fs.readFileSync(srcPath, "utf8");
    fs.writeFileSync(destPath, content);
    console.log("Copied content successfully.");
  } else {
    console.log("Source file does not exist, looking for route.ts...");
    const srcObj = path.join(
      __dirname,
      "app",
      "api",
      "rejection",
      "[type]",
      "[id]",
      "route.ts",
    );
    if (fs.existsSync(srcObj)) {
      const content = fs.readFileSync(srcObj, "utf8");
      fs.writeFileSync(destPath, content);
      console.log("Copied content successfully from original.");
      fs.renameSync(
        srcObj,
        path.join(
          __dirname,
          "app",
          "api",
          "rejection",
          "[type]",
          "[id]",
          "route.bak.ts",
        ),
      );
    } else {
      console.log("Neither source file exists!");
    }
  }
} catch (error) {
  console.error("Failed:", error);
}
