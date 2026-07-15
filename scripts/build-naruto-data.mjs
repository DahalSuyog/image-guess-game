#!/usr/bin/env node
/**
 * Generates public/data/naruto.json — a slim subset of the NarutoDB character
 * dataset, vendored locally so the NarutoProvider never depends on the flaky
 * narutodb.xyz API at runtime.
 *
 * Source: https://github.com/sriniously/narutodb-website
 *   src/pages/api/data/characters.json  (~957 KB, ~1491 characters)
 *
 * Filter (matches narutodb-website/src/utils/naruto_utils.ts):
 *   keep characters with images.length > 0 AND personal.clan AND personal.status
 *   fall back to "has image" if the strict filter leaves too few.
 *
 * Re-run anytime with:  node scripts/build-naruto-data.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_URL =
  'https://raw.githubusercontent.com/sriniously/narutodb-website/master/src/pages/api/data/characters.json';
const OUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'naruto.json');

const STRICT_MIN = 200; // if the strict filter yields fewer than this, relax to "has image"

/** First non-array string value, or first array entry. */
function firstString(v) {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.length) return String(v[0]);
  return null;
}

/** Most advanced ninja rank recorded (last era entry). */
function rankOf(c) {
  const nr = c?.rank?.ninjaRank;
  if (!nr) return null;
  const vals = Object.values(nr);
  return vals.length ? String(vals[vals.length - 1]) : null;
}

function toSlim(c) {
  const p = c.personal ?? {};
  return {
    id: c.id,
    name: c.name,
    image: (c.images ?? [])[0],
    clan: p.clan ? String(p.clan) : null,
    village: firstString(p.affiliation),
    rank: rankOf(c),
    status: p.status ? String(p.status) : null,
  };
}

async function main() {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const all = await res.json();
  console.log(`Loaded ${all.length} characters`);

  const hasImage = (c) => (c.images?.length ?? 0) > 0;
  const strict = all.filter(
    (c) => hasImage(c) && !!c.personal?.clan && !!c.personal?.status
  );

  let pool;
  if (strict.length >= STRICT_MIN) {
    console.log(`Strict filter (image + clan + status): ${strict.length} characters`);
    pool = strict;
  } else {
    console.log(`Strict filter yielded ${strict.length} (< ${STRICT_MIN}); relaxing to "has image".`);
    pool = all.filter(hasImage);
  }

  const slim = pool.map(toSlim).filter((c) => c.image);
  const bytes = Buffer.from(JSON.stringify(slim), 'utf8');

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, bytes);
  console.log(`Wrote ${slim.length} characters to ${OUT_PATH} (${(bytes.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
