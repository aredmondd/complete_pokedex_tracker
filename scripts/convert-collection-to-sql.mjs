import { readFile } from "node:fs/promises";

const USER_ID = "80c574b9-bd47-4b77-9a23-bacc02dbc019";

const TOTAL_POCKETS = 1088;

function usage() {
  console.error("Usage: node scripts/convert-collection-to-sql.mjs <path-to-export.json> [user-id]");
  console.error("Set USER_ID at the top of this file, pass it as the second argument, or set the USER_ID environment variable.");
  process.exit(1);
}

const [inputPath, userIdArg] = process.argv.slice(2);
const userId = userIdArg?.trim() || process.env.USER_ID?.trim() || USER_ID;

if (!inputPath) {
  usage();
}

if (!userId) {
  console.error("Error: user_id is required.");
  usage();
}

const text = await readFile(inputPath, "utf8");
const parsed = JSON.parse(text);
const ids = Array.isArray(parsed.collectedIds) ? parsed.collectedIds : [];

const valid = ids
  .map(Number)
  .filter((id) => Number.isInteger(id) && id >= 1 && id <= TOTAL_POCKETS);

if (valid.length === 0) {
  console.error("No valid collectedIds found in export.");
  process.exit(0);
}

const values = valid
  .sort((left, right) => left - right)
  .map((id) => `('${userId}', ${id}, now())`)
  .join(",\n");

const sql = `INSERT INTO public.collected_pokemon (user_id, pokemon_id, collected_at)
VALUES
${values}
ON CONFLICT (user_id, pokemon_id) DO NOTHING;`;

console.log(sql);
