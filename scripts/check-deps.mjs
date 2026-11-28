import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const lock = existsSync(join(root, "package-lock.json")) ? JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8")) : null;

const wanted = { ...pkg.dependencies, ...pkg.devDependencies };
const problems = [];

for (const name of Object.keys(wanted)) {
  const manifest = join(root, "node_modules", name, "package.json");
  if (!existsSync(manifest)) {
    problems.push(`${name} belum terpasang`);
    continue;
  }
  const locked = lock?.packages?.[`node_modules/${name}`]?.version;
  const installed = JSON.parse(readFileSync(manifest, "utf8")).version;
  if (locked && installed !== locked) problems.push(`${name} terpasang ${installed}, seharusnya ${locked}`);
}

if (problems.length > 0) {
  console.error("\n[check-deps] Dependensi tidak sesuai package-lock.json:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nJalankan:  npm install\nlalu ulangi perintah ini.\n");
  process.exit(1);
}
