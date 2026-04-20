from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])

# Cache per-language category lists (stable, avoids scanning 100K rows each request)
_CATEGORY_CACHE: dict = {}


def _get_categories(db: Session, lang_id: int):
    if lang_id in _CATEGORY_CACHE:
        return _CATEGORY_CACHE[lang_id]
    cats = sorted(
        c[0] for c in db.query(models.VocabItem.category)
        .filter(models.VocabItem.language_id == lang_id)
        .distinct()
        .all()
    )
    _CATEGORY_CACHE[lang_id] = cats
    return cats


@router.get("/{lang_id}", response_model=schemas.VocabListOut)
def get_vocabulary(
    lang_id: int,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    random: bool = Query(False),
    source: Optional[str] = None,
    db: Session = Depends(get_db),
):
    lang = db.query(models.Language).filter(models.Language.id == lang_id).first()
    if not lang:
        raise HTTPException(status_code=404, detail="Language not found")

    query = db.query(models.VocabItem).filter(models.VocabItem.language_id == lang_id)

    # Curated-only filter is useful to reach the hand-written example-rich entries fast
    if source:
        query = query.filter(models.VocabItem.source == source)

    if category and category != "all":
        query = query.filter(models.VocabItem.category == category)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                models.VocabItem.word.like(pattern),
                models.VocabItem.meaning_en.like(pattern),
                models.VocabItem.meaning_zh.like(pattern),
                models.VocabItem.romanization.like(pattern),
            )
        )

    total = query.count()

    if random:
        items = query.order_by(func.random()).limit(limit).all()
    else:
        # Order: curated entries first (they have examples), then the rest.
        items = (
            query.order_by(
                (models.VocabItem.source == "curated").desc(),
                models.VocabItem.id
            )
            .offset(offset).limit(limit).all()
        )

    return {
        "items": items,
        "total": total,
        "categories": _get_categories(db, lang_id),
    }
