import random
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth
import activity

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.get("/{lang_id}", response_model=List[schemas.QuizQuestion])
def generate_quiz(lang_id: int, count: int = 10, db: Session = Depends(get_db)):
    count = min(max(count, 4), 50)
    # Random selection via SQL (fast on 100K+ rows; avoids loading everything)
    quiz_items = (
        db.query(models.VocabItem)
        .filter(models.VocabItem.language_id == lang_id)
        .order_by(func.random())
        .limit(count)
        .all()
    )
    if len(quiz_items) < 4:
        raise HTTPException(status_code=400, detail="Not enough vocabulary for quiz (need at least 4)")

    # Fetch just enough distractors (3 per question) with one random query
    distractor_pool = (
        db.query(models.VocabItem)
        .filter(models.VocabItem.language_id == lang_id)
        .order_by(func.random())
        .limit(count * 5)
        .all()
    )
    questions = []

    for item in quiz_items:
        others = [v for v in distractor_pool if v.id != item.id]
        distractors = random.sample(others, min(3, len(others)))

        choices_en = [item.meaning_en] + [d.meaning_en for d in distractors]
        choices_zh = [item.meaning_zh] + [d.meaning_zh for d in distractors]

        random.shuffle(choices_en)
        random.shuffle(choices_zh)

        questions.append({
            "id": item.id,
            "word": item.word,
            "romanization": item.romanization,
            "choices_en": choices_en,
            "choices_zh": choices_zh,
            "correct_index_en": choices_en.index(item.meaning_en),
            "correct_index_zh": choices_zh.index(item.meaning_zh),
        })

    return questions


@router.post("/submit")
def submit_quiz(
    data: schemas.QuizSubmit,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    session = models.QuizSession(
        user_id=current_user.id,
        language_id=data.language_id,
        score=data.score,
        total=data.total,
    )
    db.add(session)

    now = datetime.utcnow()
    for r in data.results:
        progress = (
            db.query(models.UserProgress)
            .filter(
                models.UserProgress.user_id == current_user.id,
                models.UserProgress.vocab_id == r.vocab_id,
            )
            .first()
        )
        if not progress:
            progress = models.UserProgress(user_id=current_user.id, vocab_id=r.vocab_id)
            db.add(progress)

        progress.attempt_count += 1
        progress.last_reviewed = now
        if r.correct:
            progress.correct_count += 1
            days = min(2 ** progress.correct_count, 30)
            progress.next_review = now + timedelta(days=days)
        else:
            progress.correct_count = max(0, progress.correct_count - 1)
            progress.next_review = now + timedelta(hours=1)

    activity.mark_today(db, current_user.id)
    db.commit()
    return {"message": "Quiz submitted successfully", "score": data.score, "total": data.total}
