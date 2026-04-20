from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str


class LanguageOut(BaseModel):
    id: int
    code: str
    name_zh: str
    name_en: str
    flag: Optional[str] = None
    type: str
    romanization_system: Optional[str] = None
    description_zh: Optional[str] = None
    description_en: Optional[str] = None

    class Config:
        from_attributes = True


class VocabItemOut(BaseModel):
    id: int
    word: str
    romanization: Optional[str] = None
    meaning_zh: str
    meaning_en: str
    category: str
    language_id: int
    example_native: Optional[str] = None
    example_romanization: Optional[str] = None
    example_zh: Optional[str] = None
    example_en: Optional[str] = None
    emoji: Optional[str] = None
    source: Optional[str] = None

    class Config:
        from_attributes = True


class VocabListOut(BaseModel):
    items: List[VocabItemOut]
    total: int
    categories: List[str]


class QuizQuestion(BaseModel):
    id: int
    word: str
    romanization: Optional[str] = None
    choices_en: List[str]
    choices_zh: List[str]
    correct_index_en: int
    correct_index_zh: int


class QuizResult(BaseModel):
    vocab_id: int
    correct: bool


class QuizSubmit(BaseModel):
    language_id: int
    score: int
    total: int
    results: List[QuizResult]


class QuizSessionOut(BaseModel):
    id: int
    language_id: int
    score: int
    total: int
    completed_at: datetime

    class Config:
        from_attributes = True


class CulturalNoteOut(BaseModel):
    id: int
    title_zh: str
    title_en: str
    body_zh: str
    body_en: str
    region: Optional[str] = None
    language_id: int

    class Config:
        from_attributes = True


class ReviewSubmit(BaseModel):
    vocab_id: int
    correct: bool


class ProgressStats(BaseModel):
    total_vocab_current_lang: int
    mastered_current_lang: int
    total_mastered_all: int
    accuracy: float
    total_attempts: int
    due_count: int
    due_for_review: List[VocabItemOut]
    recent_sessions: List[QuizSessionOut]
    current_streak: int = 0
    total_days: int = 0
    today_done: bool = False
