"""Import the full IELTS word list (5040 entries) from ECDICT SQLite into English vocab.
Run: python add_ielts.py [path_to_stardict.db]
"""
import os
import sqlite3
import sys
from datetime import datetime
from database import engine, SessionLocal
import models

models.Base.metadata.create_all(bind=engine)

DEFAULT_ECDICT = r"C:\Users\悦\Downloads\dict_extracted\ecdict-sqlite\stardict.db"

BATCH = 500


def import_ielts(ecdict_path: str):
    if not os.path.exists(ecdict_path):
        print(f"ERROR: ECDICT file not found: {ecdict_path}")
        print("Download from https://github.com/skywind3000/ECDICT/releases (ecdict-sqlite-*.zip)")
        sys.exit(1)

    db = SessionLocal()
    try:
        lang = db.query(models.Language).filter(models.Language.code == "en").first()
        if not lang:
            print("ERROR: English language not in DB. Run seed_data.py first.")
            sys.exit(1)

        # Remove any previously imported IELTS batch to stay idempotent
        deleted = (
            db.query(models.VocabItem)
            .filter(models.VocabItem.language_id == lang.id,
                    models.VocabItem.source == "ecdict-ielts")
            .delete(synchronize_session=False)
        )
        if deleted:
            print(f"Removed {deleted} previous IELTS entries")
        db.commit()

        # Also drop "ielts" category items that came from the main ecdict import,
        # so the new dedicated IELTS set is the single source of truth.
        moved = (
            db.query(models.VocabItem)
            .filter(models.VocabItem.language_id == lang.id,
                    models.VocabItem.category == "ielts",
                    models.VocabItem.source == "ecdict")
            .delete(synchronize_session=False)
        )
        if moved:
            print(f"Removed {moved} IELTS-tagged entries from the main ecdict set")
        db.commit()

        src = sqlite3.connect(ecdict_path)
        src.row_factory = sqlite3.Row
        rows = src.execute("""
            SELECT word, phonetic, translation, definition
            FROM stardict
            WHERE translation != '' AND translation IS NOT NULL
              AND tag LIKE '%ielts%'
            ORDER BY bnc ASC, frq ASC
        """).fetchall()

        count = 0
        batch = []
        for r in rows:
            word = (r["word"] or "").strip()
            if not word:
                continue
            translation = (r["translation"] or "").strip()
            definition = (r["definition"] or "").strip()
            phonetic = (r["phonetic"] or "").strip()
            batch.append(models.VocabItem(
                language_id=lang.id,
                word=word,
                romanization=f"/{phonetic}/" if phonetic else None,
                meaning_zh=translation[:300] or definition[:300],
                meaning_en=definition[:300] or translation[:300],
                category="ielts",
                source="ecdict-ielts",
            ))
            if len(batch) >= BATCH:
                db.bulk_save_objects(batch)
                db.commit()
                count += len(batch)
                print(f"  Inserted {count}...")
                batch = []
        if batch:
            db.bulk_save_objects(batch)
            db.commit()
            count += len(batch)

        src.close()
        print(f"Imported {count} IELTS entries into English vocabulary")
    finally:
        db.close()


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ECDICT
    import_ielts(path)
