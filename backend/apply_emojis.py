"""Populate the `emoji` field on all vocabulary items.
Run after initial seed and any dict imports to get visual hints on cards.

  python apply_emojis.py              # update all vocab without an emoji
  python apply_emojis.py --all        # re-compute for every row (overwrite)
"""
import sys
from sqlalchemy import or_
from database import engine, SessionLocal
import models
from emoji_map import find_emoji

models.Base.metadata.create_all(bind=engine)


def apply_all(force: bool = False, batch: int = 1000):
    db = SessionLocal()
    try:
        total = db.query(models.VocabItem).count()
        print(f"Scanning {total} vocabulary items...")

        q = db.query(models.VocabItem)
        if not force:
            q = q.filter(or_(models.VocabItem.emoji == None, models.VocabItem.emoji == ""))

        processed = 0
        updated = 0
        current = 0
        chunk = []
        for v in q.yield_per(batch):
            emo = find_emoji(v.meaning_en, v.meaning_zh, v.category)
            if emo and emo != v.emoji:
                v.emoji = emo
                updated += 1
            processed += 1
            if processed % batch == 0:
                db.commit()
                print(f"  Processed {processed}/{total} (matched {updated})")
        db.commit()
        print(f"Done. Processed {processed} rows, {updated} got an emoji.")
    finally:
        db.close()


if __name__ == "__main__":
    force = "--all" in sys.argv
    apply_all(force=force)
