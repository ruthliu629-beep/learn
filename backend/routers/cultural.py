from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/cultural", tags=["cultural"])


@router.get("/{lang_id}", response_model=List[schemas.CulturalNoteOut])
def get_cultural_notes(lang_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.CulturalNote)
        .filter(models.CulturalNote.language_id == lang_id)
        .all()
    )
