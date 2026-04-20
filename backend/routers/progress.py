from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/", response_model=schemas.ProgressStats)
def get_progress(
    lang_id: Optional[int] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    all_progress = (
        db.query(models.UserProgress)
        .filter(models.UserProgress.user_id == current_user.id)
        .all()
    )

    total_attempts = sum(p.attempt_count for p in all_progress)
    total_correct = sum(p.correct_count for p in all_progress)
    accuracy = (total_correct / total_attempts * 100) if total_attempts else 0.0

    total_mastered_all = sum(1 for p in all_progress if p.correct_count >= 3)

    if lang_id:
        lang_vocab_ids = {
            v.id for v in db.query(models.VocabItem.id).filter(models.VocabItem.language_id == lang_id).all()
        }
        lang_progress = [p for p in all_progress if p.vocab_id in lang_vocab_ids]
        total_vocab_current = (
            db.query(models.VocabItem).filter(models.VocabItem.language_id == lang_id).count()
        )
        mastered_current = sum(1 for p in lang_progress if p.correct_count >= 3)
    else:
        total_vocab_current = db.query(models.VocabItem).count()
        mastered_current = total_mastered_all

    now = datetime.utcnow()
    due_progress = [p for p in all_progress if p.next_review <= now]
    if lang_id:
        due_progress = [p for p in due_progress if p.vocab_id in lang_vocab_ids]

    due_ids = [p.vocab_id for p in due_progress]
    due_items = (
        db.query(models.VocabItem).filter(models.VocabItem.id.in_(due_ids)).all() if due_ids else []
    )

    recent = (
        db.query(models.QuizSession)
        .filter(models.QuizSession.user_id == current_user.id)
        .order_by(models.QuizSession.completed_at.desc())
        .limit(10)
        .all()
    )

    return {
        "total_vocab_current_lang": total_vocab_current,
        "mastered_current_lang": mastered_current,
        "total_mastered_all": total_mastered_all,
        "accuracy": round(accuracy, 1),
        "total_attempts": total_attempts,
        "due_count": len(due_items),
        "due_for_review": due_items,
        "recent_sessions": recent,
    }


@router.post("/review")
def record_review(
    data: schemas.ReviewSubmit,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    progress = (
        db.query(models.UserProgress)
        .filter(
            models.UserProgress.user_id == current_user.id,
            models.UserProgress.vocab_id == data.vocab_id,
        )
        .first()
    )
    if not progress:
        progress = models.UserProgress(user_id=current_user.id, vocab_id=data.vocab_id)
        db.add(progress)

    now = datetime.utcnow()
    progress.attempt_count += 1
    progress.last_reviewed = now
    if data.correct:
        progress.correct_count += 1
        days = min(2 ** progress.correct_count, 30)
        progress.next_review = now + timedelta(days=days)
    else:
        progress.correct_count = max(0, progress.correct_count - 1)
        progress.next_review = now + timedelta(hours=1)

    db.commit()
    return {"message": "Review recorded", "correct_count": progress.correct_count}
