from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/languages", tags=["languages"])


@router.get("/", response_model=List[schemas.LanguageOut])
def list_languages(db: Session = Depends(get_db)):
    return db.query(models.Language).order_by(models.Language.id).all()


@router.get("/{lang_id}", response_model=schemas.LanguageOut)
def get_language(lang_id: int, db: Session = Depends(get_db)):
    lang = db.query(models.Language).filter(models.Language.id == lang_id).first()
    if not lang:
        raise HTTPException(status_code=404, detail="Language not found")
    return lang
