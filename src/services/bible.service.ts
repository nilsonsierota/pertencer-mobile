import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BibleVersion, ChapterData } from "../types";
import { requireChapter } from "./bible.loaders";

const STORAGE_KEY = "@bible_version";

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "nvi", name: "Nova Versão Internacional", abbreviation: "NVI" },
  { id: "arc", name: "Almeida Revisada Corrigida", abbreviation: "ARC" },
  { id: "acf", name: "Almeida Corrigida Fiel", abbreviation: "ACF" },
  { id: "ara", name: "Almeida Revisada Atualizada", abbreviation: "ARA" },
];

const BOOK_NAME_MAP: Record<string, string> = {
  genesis: "gn", genese: "gn",
  exodo: "ex", exodus: "ex",
  levitico: "lv", leviticus: "lv",
  numeros: "nm", numbers: "nm",
  deuteronomio: "dt", deuteronomy: "dt",
  josue: "js",
  juizes: "jd",
  rute: "rt",
  "1 samuel": "1sm",
  "2 samuel": "2sm",
  "1 reis": "1kgs",
  "2 reis": "2kgs",
  "1 cronicas": "1ch",
  "2 cronicas": "2ch",
  esdras: "ezr",
  neemias: "ne",
  ester: "et",
  jo: "job",
  salmos: "ps",
  proverbios: "prv",
  eclesiastes: "ec",
  cantares: "so",
  isaias: "is", isaías: "is",
  jeremias: "jr",
  lamentacoes: "lm",
  ezequiel: "ez",
  daniel: "dn",
  oseias: "ho",
  joel: "jl",
  amos: "am",
  obadias: "ob",
  jonas: "jn",
  miqueias: "mq",
  naum: "na",
  habacuque: "hc",
  habakkuk: "hc",
  sofonias: "zp",
  ageu: "hg",
  zacarias: "zc",
  mateus: "mt",
  marcos: "mk",
  lucas: "lk",
  joao: "jo",
  atos: "act",
  romans: "rm", romanos: "rm",
  "1 corintios": "1co",
  "2 corintios": "2co",
  galatas: "gl",
  efesios: "eph",
  filipenses: "ph",
  colossenses: "cl",
  "1 tessalonicenses": "1ts",
  "2 tessalonicenses": "2ts",
  "1 timoteo": "1tm",
  "2 timoteo": "2tm",
  tito: "tt",
  filemon: "phm",
  hebreus: "hb",
  tiago: "jm",
  "1 pedro": "1pe",
  "2 pedro": "2pe",
  "1 joao": "1jo",
  "2 joao": "2jo",
  "3 joao": "3jo",
  judas: "jud",
  apocalipse: "re",
};

type BibleJson = {
  book: string;
  bookName: string;
  chapter: number;
  verses: { verse: number; text: string }[];
};

const loadChapter = (version: string, book: string, chapter: number): BibleJson | null => {
  try {
    const data = requireChapter(version, book, chapter);
    if (!data) return null;
    return data as BibleJson;
  } catch (e) {
    console.log(`Erro ao carregar: ${version}/${book}/${chapter}`, e);
    return null;
  }
};

export const BibleService = {
  async getChapter(bookName: string, chapter: number, version: string = "nvi"): Promise<ChapterData | null> {
    const normalizedName = bookName.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const bookCode = BOOK_NAME_MAP[normalizedName] || BOOK_NAME_MAP[normalizedName.replace(/^livro\s+/i, '')];
    
    if (!bookCode) {
      console.warn("Livro não encontrado no mapeamento:", bookName, "-> normalized:", normalizedName);
      return null;
    }

    const data = loadChapter(version, bookCode, chapter);
    
    if (!data) {
      return null;
    }

    return {
      book: data.book || bookCode,
      bookName: data.bookName || bookName,
      chapter: data.chapter || chapter,
      verses: (data.verses || []).map(v => ({
        chapter: data.chapter,
        verse: v.verse,
        text: v.text,
      })),
    };
  },

  async getSavedVersion(): Promise<BibleVersion> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const version = JSON.parse(saved) as BibleVersion;
        return version;
      }
    } catch (e) {
      console.error("Erro ao recuperar versão:", e);
    }
    return BIBLE_VERSIONS[0];
  },

  async setVersion(version: BibleVersion): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(version));
    } catch (e) {
      console.error("Erro ao salvar versão:", e);
    }
  },

  getVersions(): BibleVersion[] {
    return BIBLE_VERSIONS;
  },
};