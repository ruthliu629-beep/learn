"""Favorites ("my word list") — star words and export them."""
import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
import models
import auth

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


class FavoriteToggle(BaseModel):
    vocab_id: int


@router.post("/toggle")
def toggle_favorite(
    data: FavoriteToggle,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(models.Favorite)
        .filter(models.Favorite.user_id == current_user.id,
                models.Favorite.vocab_id == data.vocab_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"favorited": False}
    vocab = db.query(models.VocabItem).filter(models.VocabItem.id == data.vocab_id).first()
    if not vocab:
        raise HTTPException(status_code=404, detail="Vocab not found")
    fav = models.Favorite(user_id=current_user.id, vocab_id=data.vocab_id)
    db.add(fav)
    db.commit()
    return {"favorited": True}


@router.get("/")
def list_favorites(
    lang_id: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.VocabItem, models.Favorite.created_at)
        .join(models.Favorite, models.Favorite.vocab_id == models.VocabItem.id)
        .filter(models.Favorite.user_id == current_user.id)
    )
    if lang_id:
        q = q.filter(models.VocabItem.language_id == lang_id)
    q = q.order_by(models.Favorite.created_at.desc())

    items = []
    for vocab, added in q.all():
        items.append({
            "id": vocab.id,
            "word": vocab.word,
            "romanization": vocab.romanization,
            "meaning_zh": vocab.meaning_zh,
            "meaning_en": vocab.meaning_en,
            "category": vocab.category,
            "language_id": vocab.language_id,
            "example_native": vocab.example_native,
            "example_romanization": vocab.example_romanization,
            "example_zh": vocab.example_zh,
            "example_en": vocab.example_en,
            "favorited_at": added.isoformat() if added else None,
        })
    return {"items": items, "total": len(items)}


@router.get("/ids")
def list_favorite_ids(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    ids = db.query(models.Favorite.vocab_id).filter(models.Favorite.user_id == current_user.id).all()
    return {"ids": [i[0] for i in ids]}


@router.get("/export")
def export_favorites(
    format: str = Query("csv", regex=r"^(csv|anki)$"),
    lang_id: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.VocabItem)
        .join(models.Favorite, models.Favorite.vocab_id == models.VocabItem.id)
        .filter(models.Favorite.user_id == current_user.id)
    )
    if lang_id:
        q = q.filter(models.VocabItem.language_id == lang_id)
    items = q.all()
    if not items:
        raise HTTPException(status_code=404, detail="No favorites to export")

    buf = io.StringIO()
    if format == "csv":
        w = csv.writer(buf)
        w.writerow(["Word", "Romanization", "Meaning (ZH)", "Meaning (EN)", "Category", "Example", "Example Meaning (ZH)", "Example Meaning (EN)"])
        for v in items:
            w.writerow([
                v.word, v.romanization or "",
                v.meaning_zh or "", v.meaning_en or "",
                v.category or "",
                v.example_native or "",
                v.example_zh or "",
                v.example_en or "",
            ])
        media = "text/csv; charset=utf-8"
        fname = "langlearn-favorites.csv"
    else:  # anki — tab-separated, front \t back \t tags
        # front = word (+ romanization), back = meanings + example
        for v in items:
            front = v.word
            if v.romanization:
                front += f" <br><small>[{v.romanization}]</small>"
            back_parts = []
            if v.meaning_zh: back_parts.append(v.meaning_zh)
            if v.meaning_en and v.meaning_en != v.meaning_zh: back_parts.append(v.meaning_en)
            if v.example_native:
                back_parts.append(f"<br><i>{v.example_native}</i>")
                if v.example_zh: back_parts.append(v.example_zh)
            back = " / ".join(back_parts).replace("\t", " ").replace("\n", " ")
            tags = f"langlearn {v.category or 'general'}"
            buf.write(f"{front}\t{back}\t{tags}\n")
        media = "text/tab-separated-values; charset=utf-8"
        fname = "langlearn-favorites-anki.txt"

    content = buf.getvalue()
    # UTF-8 BOM so Excel / Anki auto-detect encoding
    body = ("\ufeff" + content).encode("utf-8") if format == "csv" else content.encode("utf-8")
    return Response(
        content=body,
        media_type=media,
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )
