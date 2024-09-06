import fs from "fs/promises";
import type { Dirent } from "fs";

await checkBundleSize();

/**
 * Check the bundle size
 */
async function checkBundleSize() {
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0] === "--build") {
    await build().catch(panic);
  }

  const files = await fs
    .readdir("dist", {
      withFileTypes: true,
      recursive: true,
    })
    .then(onlyJsFiles);

  const bundleSize = await Promise.all(
    files.map(async (file) => {
      const filepath = `${file.parentPath}/${file.name}`;
      const stats = await fs.stat(filepath);
      return stats.size;
    }),
  ).then((sizes) => sizes.reduce((sum, b) => sum + b, 0));

  console.log(`\nTotal bundle size: ${filesize(bundleSize)}`);
}

/**
 * Build the project
 *
 * @returns {Promise<boolean>} `true` if the build was successful, `false` otherwise
 */
async function build() {
  const { stdout, exited } = Bun.spawn(["npm", "run", "build"]);
  const decoder = new TextDecoder();
  for await (const line of stdout) {
    process.stdout.write(decoder.decode(line));
  }
  const exitCode = await exited;
  if (exitCode !== 0) {
    throw new Error("Failed to build project");
  }
}

/**
 * Convert a size in bytes to a human-readable string
 *
 * @param size - The size in bytes
 * @returns {string} e.g. `1.23 MB`
 */
function filesize(size: number): string {
  const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
  const unitIndex = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    UNITS.length - 1,
  );
  const value = size / Math.pow(1024, unitIndex);
  const unit = UNITS[unitIndex];
  return `${value.toFixed(2)} ${unit}`;
}

function onlyJsFiles(files: Dirent[]) {
  return files.filter(
    (file) => file.name.endsWith(".js") && !file.isDirectory(),
  );
}

function panic(e: Error): never {
  console.error(e);
  process.exit(1);
}
