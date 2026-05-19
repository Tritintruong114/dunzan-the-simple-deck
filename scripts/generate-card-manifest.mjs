import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const cardsDir = path.join(
  root,
  "public",
  "drive-download-20260519T135205Z-3-001",
);
const outFile = path.join(root, "lib", "cardManifest.json");

const DIR_SEGMENT = "drive-download-20260519T135205Z-3-001";

function main() {
  if (!fs.existsSync(cardsDir)) {
    console.error("Cards directory not found:", cardsDir);
    process.exit(1);
  }

  const names = fs
    .readdirSync(cardsDir)
    .filter((f) => f.toLowerCase().endsWith(".png"));

  const paths = names
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/${DIR_SEGMENT}/${encodeURIComponent(name)}`);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(paths, null, 2) + "\n", "utf8");

  console.log(`Wrote ${paths.length} card paths to lib/cardManifest.json`);
}

main();
