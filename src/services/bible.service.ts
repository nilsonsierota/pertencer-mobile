import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BibleVersion, ChapterData } from "../types";

const STORAGE_KEY = "@bible_version";

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "nvi", name: "Nova Versão Internacional", abbreviation: "NVI" },
  { id: "arc", name: "Almeida Revisada Corrigida", abbreviation: "ARC" },
  { id: "acf", name: "Almeida Corrigida Fiel", abbreviation: "ACF" },
  { id: "ara", name: "Almeida Revisada Atualizada", abbreviation: "ARA" },
];

const BOOK_NAME_MAP: Record<string, string> = {
  genesis: "gn",
  genese: "gn",
  exodo: "ex",
  exodus: "ex",
  levitico: "lv",
  leviticus: "lv",
  numeros: "nm",
  numbers: "nm",
  deuteronomio: "dt",
  deuteronomy: "dt",
  josue: "js",
  juizes: "jd",
  rute: "rt",
  "1 samuel": "1sm",
  "2 samuel": "2sm",
  "1 reis": "1kgs",
  "2 reis": "2kgs",
  "1 cronicas": "1ch",
  "2 cronicas": "2ch",
  esdras: "ed",
  neemias: "ne",
  ester: "et",
  jo: "job",
  salmos: "sl",
  proverbios: "pv",
  eclesiastes: "ec",
  cantares: "ct",
  isaias: "is",
  isaías: "is",
  jeremias: "jr",
  lamentacoes: "lm",
  ezequiel: "ez",
  daniel: "dn",
  oseias: "os",
  joel: "jl",
  amos: "am",
  obadias: "ob",
  jonas: "jn",
  miqueias: "mq",
  naum: "na",
  habacuque: "hc",
  habakkuk: "hc",
  sofonias: "sf",
  ageu: "ag",
  zacarias: "zc",
  mateus: "mt",
  marcos: "mc",
  lucas: "lk",
  joao: "jo",
  atos: "at",
  romans: "rm",
  romanos: "rm",
  "1 corintios": "1co",
  "2 corintios": "2co",
  galatas: "gl",
  efesios: "ef",
  filipenses: "fp",
  colossenses: "cl",
  "1 tessalonicenses": "1ts",
  "2 tessalonicenses": "2ts",
  "1 timoteo": "1tm",
  "2 timoteo": "2tm",
  tito: "tt",
  filemon: "fm",
  hebreus: "hb",
  tiago: "tg",
  "1 pedro": "1pe",
  "2 pedro": "2pe",
  "1 joao": "1jo",
  "2 joao": "2jo",
  "3 joao": "3jo",
  judas: "jd",
  apocalipse: "ap",
};

type BibleJson = {
  book: string;
  bookName: string;
  chapter: number;
  verses: { verse: number; text: string }[];
};

const getBibleData = (version: string, bookCode: string, chapter: number): BibleJson | null => {
  try {
    switch (`${version}/${bookCode}/${chapter}`) {
      case 'nvi/gn/1': return require('../../assets/bible/nvi/gn/1.json');
      case 'nvi/gn/2': return require('../../assets/bible/nvi/gn/2.json');
      case 'nvi/gn/3': return require('../../assets/bible/nvi/gn/3.json');
      case 'nvi/gn/4': return require('../../assets/bible/nvi/gn/4.json');
      case 'nvi/gn/5': return require('../../assets/bible/nvi/gn/5.json');
      case 'nvi/gn/6': return require('../../assets/bible/nvi/gn/6.json');
      case 'nvi/gn/7': return require('../../assets/bible/nvi/gn/7.json');
      case 'nvi/gn/8': return require('../../assets/bible/nvi/gn/8.json');
      case 'nvi/gn/9': return require('../../assets/bible/nvi/gn/9.json');
      case 'nvi/gn/10': return require('../../assets/bible/nvi/gn/10.json');
      case 'nvi/gn/11': return require('../../assets/bible/nvi/gn/11.json');
      case 'nvi/gn/12': return require('../../assets/bible/nvi/gn/12.json');
      case 'nvi/gn/13': return require('../../assets/bible/nvi/gn/13.json');
      case 'nvi/gn/14': return require('../../assets/bible/nvi/gn/14.json');
      case 'nvi/gn/15': return require('../../assets/bible/nvi/gn/15.json');
      case 'nvi/gn/16': return require('../../assets/bible/nvi/gn/16.json');
      case 'nvi/gn/17': return require('../../assets/bible/nvi/gn/17.json');
      case 'nvi/gn/18': return require('../../assets/bible/nvi/gn/18.json');
      case 'nvi/gn/19': return require('../../assets/bible/nvi/gn/19.json');
      case 'nvi/gn/20': return require('../../assets/bible/nvi/gn/20.json');
      case 'nvi/mt/1': return require('../../assets/bible/nvi/mt/1.json');
      case 'nvi/mt/2': return require('../../assets/bible/nvi/mt/2.json');
      case 'nvi/mt/3': return require('../../assets/bible/nvi/mt/3.json');
      case 'nvi/mt/4': return require('../../assets/bible/nvi/mt/4.json');
      case 'nvi/mt/5': return require('../../assets/bible/nvi/mt/5.json');
      case 'nvi/mt/6': return require('../../assets/bible/nvi/mt/6.json');
      case 'nvi/mt/7': return require('../../assets/bible/nvi/mt/7.json');
      case 'nvi/mt/8': return require('../../assets/bible/nvi/mt/8.json');
      case 'nvi/mt/9': return require('../../assets/bible/nvi/mt/9.json');
      case 'nvi/mt/10': return require('../../assets/bible/nvi/mt/10.json');
      case 'nvi/mt/11': return require('../../assets/bible/nvi/mt/11.json');
      case 'nvi/mt/12': return require('../../assets/bible/nvi/mt/12.json');
      case 'nvi/mt/13': return require('../../assets/bible/nvi/mt/13.json');
      case 'nvi/mt/14': return require('../../assets/bible/nvi/mt/14.json');
      case 'nvi/mt/15': return require('../../assets/bible/nvi/mt/15.json');
      case 'nvi/mt/16': return require('../../assets/bible/nvi/mt/16.json');
      case 'nvi/mt/17': return require('../../assets/bible/nvi/mt/17.json');
      case 'nvi/mt/18': return require('../../assets/bible/nvi/mt/18.json');
      case 'nvi/mt/19': return require('../../assets/bible/nvi/mt/19.json');
      case 'nvi/mt/20': return require('../../assets/bible/nvi/mt/20.json');
      case 'nvi/mt/21': return require('../../assets/bible/nvi/mt/21.json');
      case 'nvi/mt/22': return require('../../assets/bible/nvi/mt/22.json');
      case 'nvi/mt/23': return require('../../assets/bible/nvi/mt/23.json');
      case 'nvi/mt/24': return require('../../assets/bible/nvi/mt/24.json');
      case 'nvi/mt/25': return require('../../assets/bible/nvi/mt/25.json');
      case 'nvi/mt/26': return require('../../assets/bible/nvi/mt/26.json');
      case 'nvi/mt/27': return require('../../assets/bible/nvi/mt/27.json');
      case 'nvi/mt/28': return require('../../assets/bible/nvi/mt/28.json');
      case 'nvi/mc/1': return require('../../assets/bible/nvi/mc/1.json');
      case 'nvi/mc/2': return require('../../assets/bible/nvi/mc/2.json');
      case 'nvi/mc/3': return require('../../assets/bible/nvi/mc/3.json');
      case 'nvi/mc/4': return require('../../assets/bible/nvi/mc/4.json');
      case 'nvi/mc/5': return require('../../assets/bible/nvi/mc/5.json');
      case 'nvi/mc/6': return require('../../assets/bible/nvi/mc/6.json');
      case 'nvi/mc/7': return require('../../assets/bible/nvi/mc/7.json');
      case 'nvi/mc/8': return require('../../assets/bible/nvi/mc/8.json');
      case 'nvi/mc/9': return require('../../assets/bible/nvi/mc/9.json');
      case 'nvi/mc/10': return require('../../assets/bible/nvi/mc/10.json');
      case 'nvi/mc/11': return require('../../assets/bible/nvi/mc/11.json');
      case 'nvi/mc/12': return require('../../assets/bible/nvi/mc/12.json');
      case 'nvi/mc/13': return require('../../assets/bible/nvi/mc/13.json');
      case 'nvi/mc/14': return require('../../assets/bible/nvi/mc/14.json');
      case 'nvi/mc/15': return require('../../assets/bible/nvi/mc/15.json');
      case 'nvi/mc/16': return require('../../assets/bible/nvi/mc/16.json');
      case 'nvi/lk/1': return require('../../assets/bible/nvi/lk/1.json');
      case 'nvi/lk/2': return require('../../assets/bible/nvi/lk/2.json');
      case 'nvi/lk/3': return require('../../assets/bible/nvi/lk/3.json');
      case 'nvi/lk/4': return require('../../assets/bible/nvi/lk/4.json');
      case 'nvi/lk/5': return require('../../assets/bible/nvi/lk/5.json');
      case 'nvi/lk/6': return require('../../assets/bible/nvi/lk/6.json');
      case 'nvi/lk/7': return require('../../assets/bible/nvi/lk/7.json');
      case 'nvi/lk/8': return require('../../assets/bible/nvi/lk/8.json');
      case 'nvi/lk/9': return require('../../assets/bible/nvi/lk/9.json');
      case 'nvi/lk/10': return require('../../assets/bible/nvi/lk/10.json');
      case 'nvi/lk/11': return require('../../assets/bible/nvi/lk/11.json');
      case 'nvi/lk/12': return require('../../assets/bible/nvi/lk/12.json');
      case 'nvi/lk/13': return require('../../assets/bible/nvi/lk/13.json');
      case 'nvi/lk/14': return require('../../assets/bible/nvi/lk/14.json');
      case 'nvi/lk/15': return require('../../assets/bible/nvi/lk/15.json');
      case 'nvi/lk/16': return require('../../assets/bible/nvi/lk/16.json');
      case 'nvi/lk/17': return require('../../assets/bible/nvi/lk/17.json');
      case 'nvi/lk/18': return require('../../assets/bible/nvi/lk/18.json');
      case 'nvi/lk/19': return require('../../assets/bible/nvi/lk/19.json');
      case 'nvi/lk/20': return require('../../assets/bible/nvi/lk/20.json');
      case 'nvi/lk/21': return require('../../assets/bible/nvi/lk/21.json');
      case 'nvi/lk/22': return require('../../assets/bible/nvi/lk/22.json');
      case 'nvi/lk/23': return require('../../assets/bible/nvi/lk/23.json');
      case 'nvi/lk/24': return require('../../assets/bible/nvi/lk/24.json');
      case 'nvi/jo/1': return require('../../assets/bible/nvi/jo/1.json');
      case 'nvi/jo/2': return require('../../assets/bible/nvi/jo/2.json');
      case 'nvi/jo/3': return require('../../assets/bible/nvi/jo/3.json');
      case 'nvi/jo/4': return require('../../assets/bible/nvi/jo/4.json');
      case 'nvi/jo/5': return require('../../assets/bible/nvi/jo/5.json');
      case 'nvi/jo/6': return require('../../assets/bible/nvi/jo/6.json');
      case 'nvi/jo/7': return require('../../assets/bible/nvi/jo/7.json');
      case 'nvi/jo/8': return require('../../assets/bible/nvi/jo/8.json');
      case 'nvi/jo/9': return require('../../assets/bible/nvi/jo/9.json');
      case 'nvi/jo/10': return require('../../assets/bible/nvi/jo/10.json');
      case 'nvi/jo/11': return require('../../assets/bible/nvi/jo/11.json');
      case 'nvi/jo/12': return require('../../assets/bible/nvi/jo/12.json');
      case 'nvi/jo/13': return require('../../assets/bible/nvi/jo/13.json');
      case 'nvi/jo/14': return require('../../assets/bible/nvi/jo/14.json');
      case 'nvi/jo/15': return require('../../assets/bible/nvi/jo/15.json');
      case 'nvi/jo/16': return require('../../assets/bible/nvi/jo/16.json');
      case 'nvi/jo/17': return require('../../assets/bible/nvi/jo/17.json');
      case 'nvi/jo/18': return require('../../assets/bible/nvi/jo/18.json');
      case 'nvi/jo/19': return require('../../assets/bible/nvi/jo/19.json');
      case 'nvi/jo/20': return require('../../assets/bible/nvi/jo/20.json');
      case 'nvi/jo/21': return require('../../assets/bible/nvi/jo/21.json');
      case 'arc/gn/1': return require('../../assets/bible/arc/gn/1.json');
      case 'arc/gn/2': return require('../../assets/bible/arc/gn/2.json');
      case 'arc/gn/3': return require('../../assets/bible/arc/gn/3.json');
      case 'arc/gn/4': return require('../../assets/bible/arc/gn/4.json');
      case 'arc/gn/5': return require('../../assets/bible/arc/gn/5.json');
      case 'arc/gn/6': return require('../../assets/bible/arc/gn/6.json');
      case 'arc/gn/7': return require('../../assets/bible/arc/gn/7.json');
      case 'arc/gn/8': return require('../../assets/bible/arc/gn/8.json');
      case 'arc/gn/9': return require('../../assets/bible/arc/gn/9.json');
      case 'arc/gn/10': return require('../../assets/bible/arc/gn/10.json');
      case 'arc/gn/11': return require('../../assets/bible/arc/gn/11.json');
      case 'arc/gn/12': return require('../../assets/bible/arc/gn/12.json');
      case 'arc/gn/13': return require('../../assets/bible/arc/gn/13.json');
      case 'arc/gn/14': return require('../../assets/bible/arc/gn/14.json');
      case 'arc/gn/15': return require('../../assets/bible/arc/gn/15.json');
      case 'arc/gn/16': return require('../../assets/bible/arc/gn/16.json');
      case 'arc/gn/17': return require('../../assets/bible/arc/gn/17.json');
      case 'arc/gn/18': return require('../../assets/bible/arc/gn/18.json');
      case 'arc/gn/19': return require('../../assets/bible/arc/gn/19.json');
      case 'arc/gn/20': return require('../../assets/bible/arc/gn/20.json');
      case 'arc/mt/1': return require('../../assets/bible/arc/mt/1.json');
      case 'arc/mt/2': return require('../../assets/bible/arc/mt/2.json');
      case 'arc/mt/3': return require('../../assets/bible/arc/mt/3.json');
      case 'arc/mt/4': return require('../../assets/bible/arc/mt/4.json');
      case 'arc/mt/5': return require('../../assets/bible/arc/mt/5.json');
      case 'arc/mt/6': return require('../../assets/bible/arc/mt/6.json');
      case 'arc/mt/7': return require('../../assets/bible/arc/mt/7.json');
      case 'arc/mt/8': return require('../../assets/bible/arc/mt/8.json');
      case 'arc/mt/9': return require('../../assets/bible/arc/mt/9.json');
      case 'arc/mt/10': return require('../../assets/bible/arc/mt/10.json');
      case 'arc/mt/11': return require('../../assets/bible/arc/mt/11.json');
      case 'arc/mt/12': return require('../../assets/bible/arc/mt/12.json');
      case 'arc/mt/13': return require('../../assets/bible/arc/mt/13.json');
      case 'arc/mt/14': return require('../../assets/bible/arc/mt/14.json');
      case 'arc/mt/15': return require('../../assets/bible/arc/mt/15.json');
      case 'arc/mt/16': return require('../../assets/bible/arc/mt/16.json');
      case 'arc/mt/17': return require('../../assets/bible/arc/mt/17.json');
      case 'arc/mt/18': return require('../../assets/bible/arc/mt/18.json');
      case 'arc/mt/19': return require('../../assets/bible/arc/mt/19.json');
      case 'arc/mt/20': return require('../../assets/bible/arc/mt/20.json');
      case 'arc/mt/21': return require('../../assets/bible/arc/mt/21.json');
      case 'arc/mt/22': return require('../../assets/bible/arc/mt/22.json');
      case 'arc/mt/23': return require('../../assets/bible/arc/mt/23.json');
      case 'arc/mt/24': return require('../../assets/bible/arc/mt/24.json');
      case 'arc/mt/25': return require('../../assets/bible/arc/mt/25.json');
      case 'arc/mt/26': return require('../../assets/bible/arc/mt/26.json');
      case 'arc/mt/27': return require('../../assets/bible/arc/mt/27.json');
      case 'arc/mt/28': return require('../../assets/bible/arc/mt/28.json');
      case 'arc/lk/1': return require('../../assets/bible/arc/lk/1.json');
      case 'arc/lk/2': return require('../../assets/bible/arc/lk/2.json');
      case 'arc/lk/3': return require('../../assets/bible/arc/lk/3.json');
      case 'arc/lk/4': return require('../../assets/bible/arc/lk/4.json');
      case 'arc/lk/5': return require('../../assets/bible/arc/lk/5.json');
      case 'arc/lk/6': return require('../../assets/bible/arc/lk/6.json');
      case 'arc/lk/7': return require('../../assets/bible/arc/lk/7.json');
      case 'arc/lk/8': return require('../../assets/bible/arc/lk/8.json');
      case 'arc/lk/9': return require('../../assets/bible/arc/lk/9.json');
      case 'arc/lk/10': return require('../../assets/bible/arc/lk/10.json');
      case 'arc/lk/11': return require('../../assets/bible/arc/lk/11.json');
      case 'arc/lk/12': return require('../../assets/bible/arc/lk/12.json');
      case 'arc/lk/13': return require('../../assets/bible/arc/lk/13.json');
      case 'arc/lk/14': return require('../../assets/bible/arc/lk/14.json');
      case 'arc/lk/15': return require('../../assets/bible/arc/lk/15.json');
      case 'arc/lk/16': return require('../../assets/bible/arc/lk/16.json');
      case 'arc/lk/17': return require('../../assets/bible/arc/lk/17.json');
      case 'arc/lk/18': return require('../../assets/bible/arc/lk/18.json');
      case 'arc/lk/19': return require('../../assets/bible/arc/lk/19.json');
      case 'arc/lk/20': return require('../../assets/bible/arc/lk/20.json');
      case 'arc/lk/21': return require('../../assets/bible/arc/lk/21.json');
      case 'arc/lk/22': return require('../../assets/bible/arc/lk/22.json');
      case 'arc/lk/23': return require('../../assets/bible/arc/lk/23.json');
      case 'arc/lk/24': return require('../../assets/bible/arc/lk/24.json');
      default: return null;
    }
  } catch (e) {
    console.log(`Arquivo não encontrado: ${version}/${bookCode}/${chapter}`);
    return null;
  }
};

export const BibleService = {
  async getChapter(bookName: string, chapter: number, version: string = "nvi"): Promise<ChapterData | null> {
    const normalizedName = bookName.toLowerCase().trim();
    const bookCode = BOOK_NAME_MAP[normalizedName] || BOOK_NAME_MAP[normalizedName.replace(/^livro\s+/i, '')];
    
    if (!bookCode) {
      console.warn("Livro não encontrado no mapeamento:", bookName);
      return null;
    }

    const data = getBibleData(version, bookCode, chapter);
    
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