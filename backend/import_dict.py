"""Import open-source dictionary files into the vocabulary database.

Supported formats:
  - CC-CEDICT (Chinese-English)     → Mandarin (zh-cmn)
  - CC-Canto   (Cantonese-English)   → Cantonese (zh-yue)
  - JMdict (Japanese, XML)           → Japanese   (ja)

Usage:
    python import_dict.py cedict  path/to/cedict_ts.u8
    python import_dict.py ccanto  path/to/cccanto-webdist.txt
    python import_dict.py jmdict  path/to/JMdict_e      [--limit 20000]

See DICT_IMPORT.md for dictionary download links and license info.
"""
import argparse
import os
import re
import sys
from typing import Iterable, Iterator, Optional, Tuple

from database import engine, SessionLocal
import models

models.Base.metadata.create_all(bind=engine)

BATCH_SIZE = 2000


# ---------------------------------------------------------------------------
# CC-CEDICT parser
# CC-CEDICT format:
#   Traditional Simplified [pinyin] /meaning 1/meaning 2/.../
#   # comments
# ---------------------------------------------------------------------------
CEDICT_LINE = re.compile(r"^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+/(.+)/\s*$")


def parse_cedict(path: str) -> Iterator[dict]:
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            m = CEDICT_LINE.match(line)
            if not m:
                continue
            trad, simp, pinyin, defs = m.groups()
            meanings = [d.strip() for d in defs.split("/") if d.strip()]
            yield {
                "word": simp,
                "romanization": normalize_pinyin(pinyin),
                "meaning_en": "; ".join(meanings[:3]),
                "meaning_zh": simp,  # CC-CEDICT has no Chinese gloss
                "category": guess_category(meanings),
            }


def normalize_pinyin(p: str) -> str:
    """CC-CEDICT uses numbered tones (ni3 hao3). Convert to tone marks (nǐ hǎo)."""
    tone_map = {
        'a': 'āáǎà', 'e': 'ēéěè', 'i': 'īíǐì',
        'o': 'ōóǒò', 'u': 'ūúǔù', 'ü': 'ǖǘǚǜ',
        'A': 'ĀÁǍÀ', 'E': 'ĒÉĚÈ', 'I': 'ĪÍǏÌ',
        'O': 'ŌÓǑÒ', 'U': 'ŪÚǓÙ',
    }
    out = []
    for syl in p.split():
        if not syl or not syl[-1].isdigit():
            out.append(syl.replace("u:", "ü"))
            continue
        tone = int(syl[-1])
        body = syl[:-1].replace("u:", "ü")
        if tone == 5 or not (1 <= tone <= 4):
            out.append(body)
            continue
        # Priority: a > e > o > iu/ui last > last vowel
        idx = -1
        for v in "aeoAEO":
            if v in body:
                idx = body.index(v); break
        if idx < 0:
            if "iu" in body: idx = body.index("u")
            elif "ui" in body: idx = body.index("i")
            elif "Iu" in body: idx = body.index("u")
            else:
                for v in "iuüIUÜ":
                    if v in body:
                        idx = body.rindex(v); break
        if idx >= 0:
            vowel = body[idx]
            marked = tone_map.get(vowel, "" * 4)
            if marked:
                body = body[:idx] + marked[tone - 1] + body[idx+1:]
        out.append(body)
    return " ".join(out)


def guess_category(meanings: list) -> str:
    """Rough category guess from English meanings."""
    joined = " ".join(meanings).lower()
    keywords = {
        "food": ["food", "dish", "eat", "rice", "noodle", "meat", "fruit", "vegetable", "drink", "tea", "wine"],
        "family": ["father", "mother", "brother", "sister", "family", "parent", "child"],
        "travel": ["airport", "station", "hotel", "road", "street", "map", "travel", "ticket"],
        "body": ["head", "eye", "ear", "hand", "foot", "leg", "heart", "body"],
        "numbers": ["number", "digit"],
        "colors": ["color", "colour", "red", "blue", "green", "yellow", "black", "white"],
        "time": ["day", "morning", "evening", "year", "month", "week", "time", "hour"],
        "feelings": ["happy", "sad", "love", "angry", "fear"],
    }
    for cat, kws in keywords.items():
        if any(k in joined for k in kws):
            return cat
    return "general"


# ---------------------------------------------------------------------------
# CC-Canto parser (same format as CEDICT plus a {Jyutping} field)
# Example: 你好 你好 [ni3 hao3] {nei5 hou2} /hello/
# ---------------------------------------------------------------------------
CANTO_LINE = re.compile(r"^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\{([^}]+)\}\s+/(.+)/\s*$")


def parse_ccanto(path: str) -> Iterator[dict]:
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            m = CANTO_LINE.match(line)
            if not m:
                continue
            trad, simp, _pinyin, jyutping, defs = m.groups()
            meanings = [d.strip() for d in defs.split("/") if d.strip()]
            yield {
                "word": trad,
                "romanization": jyutping.strip(),
                "meaning_en": "; ".join(meanings[:3]),
                "meaning_zh": simp,
                "category": guess_category(meanings),
            }


# ---------------------------------------------------------------------------
# MOE Taiwanese Dictionary (闽南语/台语) — JSON from g0v/moedict-data-twblg.
# Each entry: { "title": "汉字", "heteronyms": [{
#   "trs": "Tâi-lô", "definitions": [{"type": "動", "def": "...",
#   "example": ["￹Tw text￺Tâi-lô￻Mandarin"]}]}] }
# Example uses U+FF79 ￹, U+FF7A ￺, U+FF7B ￻ as field delimiters.
# ---------------------------------------------------------------------------
_MOE_EX_PATTERN = re.compile(r"\uff79(.*?)\uff7a(.*?)\uff7b(.*)", re.DOTALL)


def parse_moedict_twblg(path: str, limit: int = 20000) -> Iterator[dict]:
    import json
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    type_map = {
        "名": "nouns", "動": "verbs", "形": "adjectives", "副": "adverbs",
        "代": "pronouns", "數": "numbers", "助": "particles",
        "介": "prepositions", "量": "measures", "嘆": "interjections",
    }
    count = 0
    for entry in data:
        if count >= limit:
            break
        title = (entry.get("title") or "").strip()
        hets = entry.get("heteronyms") or []
        if not title or not hets:
            continue
        het = hets[0]
        trs = (het.get("trs") or "").strip()
        defs = het.get("definitions") or []
        if not defs:
            continue
        first = defs[0]
        meaning_zh = (first.get("def") or "").strip()
        if not meaning_zh:
            continue
        pos = (first.get("type") or "").strip()

        example_native = example_rom = example_zh_text = None
        examples = first.get("example") or []
        if examples:
            m = _MOE_EX_PATTERN.search(examples[0])
            if m:
                example_native = m.group(1).strip()
                example_rom = m.group(2).strip()
                example_zh_text = m.group(3).strip() or None

        count += 1
        yield {
            "word": title,
            "romanization": trs or None,
            "meaning_zh": meaning_zh[:300],
            "meaning_en": meaning_zh[:300],  # no English in MOE
            "category": type_map.get(pos, "general"),
            "example_native": example_native,
            "example_romanization": example_rom,
            "example_zh": example_zh_text,
            "example_en": None,
        }


# ---------------------------------------------------------------------------
# kaikki.org Wiktionary extraction — JSONL format.
# Each line is a JSON object for one dictionary entry:
#   { "word": "...", "pos": "...", "lang_code": "fr|es|de|...",
#     "sounds": [{"ipa": "/.../"}, ...],
#     "senses": [{"glosses": ["English definition"]}, ...]  }
# Works for French, Spanish, German, Korean, Min Nan, etc.
# ---------------------------------------------------------------------------
def parse_kaikki_jsonl(path: str, limit: int = 100000) -> Iterator[dict]:
    import json
    seen = set()
    count = 0
    with open(path, encoding="utf-8") as f:
        for line in f:
            if count >= limit:
                break
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            word = (obj.get("word") or "").strip()
            if not word:
                continue
            key = word.lower()
            if key in seen:
                continue

            # IPA from sounds
            ipa = None
            for s in obj.get("sounds", []) or []:
                if s.get("ipa"):
                    ipa = s["ipa"]
                    break

            # Translations (for source-language Wiktionaries like es-extract)
            # Each entry: {"lang_code": "en", "lang": "...", "word": "..."}
            en_translations = []
            zh_translations = []
            for tr in obj.get("translations", []) or []:
                lc = (tr.get("lang_code") or "").lower()
                tw = (tr.get("word") or "").strip()
                if not tw:
                    continue
                if lc == "en":
                    en_translations.append(tw)
                elif lc in ("zh", "cmn", "zh-cn", "zh-hans", "zh-hant"):
                    zh_translations.append(tw)

            # Glosses from senses (fallback or primary depending on source)
            glosses = []
            for sense in obj.get("senses", []) or []:
                for g in sense.get("glosses", []) or []:
                    if g and g not in glosses:
                        glosses.append(g)

            # Build meanings with the best available data
            if en_translations:
                meaning_en = ", ".join(en_translations[:3])[:300]
            elif glosses:
                meaning_en = "; ".join(glosses[:3])[:300]
            else:
                continue

            if zh_translations:
                meaning_zh = ", ".join(zh_translations[:3])[:300]
            else:
                meaning_zh = meaning_en  # fallback

            seen.add(key)
            count += 1
            pos = obj.get("pos") or ""
            yield {
                "word": word,
                "romanization": ipa,
                "meaning_en": meaning_en,
                "meaning_zh": meaning_zh,
                "category": kaikki_category(pos, glosses or en_translations),
            }


def kaikki_category(pos: str, glosses: list) -> str:
    p = (pos or "").lower()
    if p == "verb": return "verbs"
    if p in ("adj", "adjective"): return "adjectives"
    if p == "adv": return "adverbs"
    if p == "num": return "numbers"
    if p in ("noun", "name", "proper noun"):
        return guess_category(glosses)
    return "general"


# ---------------------------------------------------------------------------
# ECDICT (English-Chinese) — SQLite with columns:
# word, phonetic, definition, translation, pos, tag, bnc, frq, ...
# We select only entries with a corpus rank or exam tag (≈80-100K core words)
# to avoid the 3.4M noisy long tail.
# ---------------------------------------------------------------------------
def parse_ecdict_sqlite(path: str, limit: int = 100000) -> Iterator[dict]:
    import sqlite3
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    rows = cur.execute("""
        SELECT word, phonetic, translation, definition, pos, tag, bnc, frq
        FROM stardict
        WHERE translation != '' AND translation IS NOT NULL
          AND (bnc > 0 OR frq > 0 OR tag != '')
        ORDER BY
          CASE WHEN bnc > 0 THEN bnc ELSE 99999 END ASC,
          CASE WHEN frq > 0 THEN frq ELSE 99999 END ASC
        LIMIT ?
    """, (limit,))
    for row in rows:
        word = (row["word"] or "").strip()
        if not word:
            continue
        translation = (row["translation"] or "").strip()
        definition = (row["definition"] or "").strip()
        phonetic = (row["phonetic"] or "").strip()
        yield {
            "word": word,
            "romanization": f"/{phonetic}/" if phonetic else None,
            "meaning_zh": translation[:300] or definition[:300],
            "meaning_en": definition[:300] or translation[:300],
            "category": ecdict_category(row["tag"], row["pos"]),
        }
    conn.close()


def ecdict_category(tag: str, pos: str) -> str:
    """Pick a category from ECDICT tag string (zk gk cet4 cet6 ky toefl ielts gre)."""
    if not tag:
        return "general"
    t = tag.lower()
    if "zk" in t: return "middle-school"
    if "gk" in t: return "high-school"
    if "cet4" in t: return "cet4"
    if "cet6" in t: return "cet6"
    if "ky" in t: return "postgrad"
    if "toefl" in t: return "toefl"
    if "ielts" in t: return "ielts"
    if "gre" in t: return "gre"
    return "general"


# ---------------------------------------------------------------------------
# KENGDIC (Korean-English) — TSV format
# Columns: id, surface, hanja, gloss, level, created, source
# ---------------------------------------------------------------------------
def parse_kengdic(path: str) -> Iterator[dict]:
    import csv
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            word = (row.get("surface") or "").strip()
            gloss = (row.get("gloss") or "").strip()
            if not word or not gloss:
                continue
            # Clean up double spaces and stray whitespace
            gloss_clean = " ".join(gloss.split())
            yield {
                "word": word,
                "romanization": None,  # KENGDIC has no romanization column
                "meaning_en": gloss_clean[:200],
                "meaning_zh": gloss_clean[:200],  # fallback; no native zh
                "category": guess_category([gloss_clean]),
            }


# ---------------------------------------------------------------------------
# JMdict (Japanese) — minimal XML streaming parser
# Each <entry> has <k_ele><keb>, <r_ele><reb>, <sense><gloss>
# ---------------------------------------------------------------------------
def parse_jmdict(path: str, limit: int = 50000) -> Iterator[dict]:
    import xml.etree.ElementTree as ET
    count = 0
    context = ET.iterparse(path, events=("end",))
    for _, elem in context:
        if elem.tag != "entry":
            continue
        keb = elem.findtext(".//k_ele/keb")
        reb = elem.findtext(".//r_ele/reb")
        glosses = [g.text for g in elem.findall(".//sense/gloss") if g.text]
        word = keb or reb
        if not word or not glosses:
            elem.clear()
            continue
        yield {
            "word": word,
            "romanization": reb if keb and reb != keb else None,
            "meaning_en": "; ".join(glosses[:3]),
            "meaning_zh": glosses[0] if glosses else "",
            "category": "general",
        }
        count += 1
        elem.clear()
        if count >= limit:
            break


# ---------------------------------------------------------------------------
# DB insertion
# ---------------------------------------------------------------------------
def insert_records(lang_code: str, records: Iterable[dict], source: str, replace_existing: bool = True):
    db = SessionLocal()
    try:
        lang = db.query(models.Language).filter(models.Language.code == lang_code).first()
        if not lang:
            print(f"ERROR: language '{lang_code}' not found. Run seed_data.py first.")
            return 0

        if replace_existing:
            deleted = (
                db.query(models.VocabItem)
                .filter(models.VocabItem.language_id == lang.id,
                        models.VocabItem.source == source)
                .delete(synchronize_session=False)
            )
            if deleted:
                print(f"Removed {deleted} previous '{source}' items")
                db.commit()

        count = 0
        batch = []
        for rec in records:
            batch.append(models.VocabItem(
                language_id=lang.id,
                word=rec["word"],
                romanization=rec.get("romanization"),
                meaning_zh=rec.get("meaning_zh") or rec.get("meaning_en", ""),
                meaning_en=rec.get("meaning_en", ""),
                category=rec.get("category", "general"),
                example_native=rec.get("example_native"),
                example_romanization=rec.get("example_romanization"),
                example_zh=rec.get("example_zh"),
                example_en=rec.get("example_en"),
                source=source,
            ))
            if len(batch) >= BATCH_SIZE:
                db.bulk_save_objects(batch)
                db.commit()
                count += len(batch)
                print(f"  Inserted {count} items...")
                batch = []
        if batch:
            db.bulk_save_objects(batch)
            db.commit()
            count += len(batch)
        print(f"Imported {count} items from {source} into {lang_code}")
        return count
    finally:
        db.close()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Import dictionaries into the learning DB.")
    ap.add_argument("format", choices=["cedict", "ccanto", "jmdict", "kengdic", "ecdict", "kaikki", "moedict"],
                    help="Dictionary format")
    ap.add_argument("path", help="Path to the dictionary file")
    ap.add_argument("--limit", type=int, default=100000, help="Max entries to import")
    ap.add_argument("--target", help="Target language code (required for kaikki; e.g. fr, es, de, zh-nan)")
    ap.add_argument("--keep", action="store_true",
                    help="Keep existing imported entries (default: replace same-source)")
    args = ap.parse_args()

    if not os.path.exists(args.path):
        print(f"File not found: {args.path}")
        sys.exit(1)

    replace = not args.keep
    if args.format == "cedict":
        insert_records("zh-cmn", parse_cedict(args.path), "cc-cedict", replace)
    elif args.format == "ccanto":
        insert_records("zh-yue", parse_ccanto(args.path), "cc-canto", replace)
    elif args.format == "jmdict":
        insert_records("ja", parse_jmdict(args.path, args.limit), "jmdict", replace)
    elif args.format == "kengdic":
        insert_records("ko", parse_kengdic(args.path), "kengdic", replace)
    elif args.format == "ecdict":
        insert_records("en", parse_ecdict_sqlite(args.path, args.limit), "ecdict", replace)
    elif args.format == "kaikki":
        if not args.target:
            print("ERROR: --target LANG_CODE required for kaikki (e.g. fr, es, de, zh-nan)")
            sys.exit(1)
        insert_records(args.target, parse_kaikki_jsonl(args.path, args.limit),
                       f"kaikki-{args.target}", replace)
    elif args.format == "moedict":
        insert_records("zh-nan", parse_moedict_twblg(args.path, args.limit), "moedict-twblg", replace)


if __name__ == "__main__":
    main()
