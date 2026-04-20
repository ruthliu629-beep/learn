"""Track daily study activity for streak computation."""
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
import models


def mark_today(db: Session, user_id: int) -> None:
    """Record that the user studied today (idempotent)."""
    today_str = date.today().isoformat()
    existing = (
        db.query(models.StudyDay)
        .filter(models.StudyDay.user_id == user_id, models.StudyDay.day == today_str)
        .first()
    )
    if not existing:
        db.add(models.StudyDay(user_id=user_id, day=today_str))


def compute_streak(db: Session, user_id: int) -> dict:
    """Return streak info: current streak days and total active days."""
    days = (
        db.query(models.StudyDay.day)
        .filter(models.StudyDay.user_id == user_id)
        .order_by(models.StudyDay.day.desc())
        .all()
    )
    day_set = {d[0] for d in days}
    total = len(day_set)

    today = date.today()
    # Streak counts backwards from today (or yesterday if user hasn't studied today yet)
    current = 0
    cursor = today
    # Allow "today" to be skipped; streak still counts from yesterday
    if cursor.isoformat() not in day_set:
        cursor -= timedelta(days=1)
    while cursor.isoformat() in day_set:
        current += 1
        cursor -= timedelta(days=1)

    return {
        "current_streak": current,
        "total_days": total,
        "today_done": today.isoformat() in day_set,
    }
