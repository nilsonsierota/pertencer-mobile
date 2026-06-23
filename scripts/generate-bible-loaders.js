/**
 * Scans assets/bible/ and generates src/services/bible.loaders.ts
 * with a switch-based require map for all Bible chapter JSON files.
 */
const fs = require("fs");
const path = require("path");

const BIBLE_DIR = path.join(__dirname, "..", "assets", "bible");
const OUTPUT = path.join(__dirname, "..", "src", "services", "bible.loaders.ts");
const VERSIONS = ["nvi", "arc", "acf", "ara"];

const entries = [];

for (const version of VERSIONS) {
  const versionDir = path.join(BIBLE_DIR, version);
  if (!fs.existsSync(versionDir)) continue;
  const books = fs.readdirSync(versionDir).sort();
  for (const book of books) {
    const bookDir = path.join(versionDir, book);
    const stat = fs.statSync(bookDir);
    if (!stat.isDirectory()) continue;
    const files = fs.readdirSync(bookDir).filter(f => f.endsWith(".json")).sort((a, b) => {
      const na = parseInt(a.replace(".json", ""), 10);
      const nb = parseInt(b.replace(".json", ""), 10);
      return na - nb;
    });
    for (const file of files) {
      const chapter = file.replace(".json", "");
      entries.push({ version, book, chapter });
    }
  }
}

let code = `// GENERATED FILE - Do not edit. Run \`node scripts/generate-bible-loaders.js\` to regenerate.
// Total entries: ${entries.length}

type LoaderResult = {
  book: string;
  bookName: string;
  chapter: number;
  verses: { verse: number; text: string }[];
};

export function requireChapter(version: string, book: string, chapter: number): LoaderResult | null {
  switch (\`\${version}/\${book}/\${chapter}\`) {
`;

for (const e of entries) {
  code += `    case "${e.version}/${e.book}/${e.chapter}": return require("../../assets/bible/${e.version}/${e.book}/${e.chapter}.json");\n`;
}

code += `    default: return null;
  }
}
`;

fs.writeFileSync(OUTPUT, code, "utf-8");
console.log(`Generated ${OUTPUT} with ${entries.length} entries`);
