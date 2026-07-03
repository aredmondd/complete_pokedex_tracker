import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const sourcePath = path.resolve("Pokemon.csv");
const outputPath = path.resolve("src/data/pokemon.json");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

const csv = await readFile(sourcePath, "utf8");
const [headers, ...rows] = parseCsv(csv);
const idIndex = headers.indexOf("ID");
const nameIndex = headers.indexOf("Name");
const type1Index = headers.indexOf("Type1");
const type2Index = headers.indexOf("Type2");
const generationIndex = headers.indexOf("Generation");

const pokemonById = new Map();

for (const row of rows) {
  const id = Number(row[idIndex]);

  if (!Number.isInteger(id) || pokemonById.has(id)) {
    continue;
  }

  pokemonById.set(id, {
    id,
    name: row[nameIndex].trim(),
    types: [row[type1Index], row[type2Index]].map((type) => type.trim()).filter(Boolean),
    generation: Number(row[generationIndex])
  });
}

const pokemon = [...pokemonById.values()].sort((left, right) => left.id - right.id);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedFrom: "Pokemon.csv",
      strategy: "First CSV row for each National Pokedex number; alternate forms are ignored for binder placement.",
      count: pokemon.length,
      pokemon
    },
    null,
    2
  )}\n`
);

console.log(`Wrote ${pokemon.length} National Pokedex entries to ${outputPath}`);
