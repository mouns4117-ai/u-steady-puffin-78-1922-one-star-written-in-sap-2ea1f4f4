// One Star, Written in Sap — make.fun entry program.
// Writes a single one-line 1-star houseplant review to /output/entry.txt.

import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "One star. He waters me whenever he remembers, then looks betrayed when I drink it all at once — I've been in this same pot since 2019, and the drainage hole is, as far as I can tell, a rumour.";

const MIN_CHARS = 1;
const MAX_CHARS = 279;

function fail(message: string): never {
  throw new Error(`entry rejected: ${message}`);
}

function main(): void {
  // Gate: 1-279 chars, single line, non-whitespace, no control chars, no BOM.
  if (ENTRY.length < MIN_CHARS || ENTRY.length > MAX_CHARS) {
    fail(`length ${ENTRY.length} outside ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (ENTRY.trim().length === 0) fail("entry is only whitespace");
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) fail("entry is not a single line");
  if (ENTRY.charCodeAt(0) === 0xfeff) fail("entry starts with a BOM");
  for (const ch of ENTRY) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") fail("entry contains a control character");
  }
  const bytes = Buffer.byteLength(ENTRY, "utf8");
  if (bytes > 4 * MAX_CHARS) fail(`byte length ${bytes} exceeds sanity cap`);
  // Fail fast: the entry must survive a UTF-8 round-trip unchanged.
  const roundTrip = Buffer.from(ENTRY, "utf8").toString("utf8");
  if (roundTrip !== ENTRY) fail("entry is not clean UTF-8");
  if (/[\uFFFD]/.test(ENTRY)) fail("entry contains a replacement character");

  // Empty /output contents only; /output itself is a mounted directory, never remove it.
  mkdirSync("/output", { recursive: true });
  for (const name of readdirSync("/output")) {
    rmSync(`/output/${name}`, { recursive: true, force: true });
  }

  writeFileSync("/output/entry.txt", ENTRY, "utf8");

  // Read-back verification: the file must hold exactly the entry.
  const back = readFileSync("/output/entry.txt", "utf8");
  if (back !== ENTRY) fail("read-back mismatch");
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote /output/entry.txt (${ENTRY.length} chars, sha256 ${sha})`);
}

main();
