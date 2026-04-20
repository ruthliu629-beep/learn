from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    quiz_sessions = relationship("QuizSession", back_populates="user", cascade="all, delete-orphan")


class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name_zh = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    flag = Column(String)
    type = Column(String, nullable=False)  # "dialect" or "foreign"
    romanization_system = Column(String)
    description_zh = Column(Text)
    description_en = Column(Text)

    vocab_items = relationship("VocabItem", back_populates="language", cascade="all, delete-orphan")
    cultural_notes = relationship("CulturalNote", back_populates="language", cascade="all, delete-orphan")


class VocabItem(Base):
    __tablename__ = "vocab_items"
    id = Column(Integer, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False, index=True)
    word = Column(String, nullable=False)
    romanization = Column(String)
    meaning_zh = Column(String, nullable=False)
    meaning_en = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    example_native = Column(Text)
    example_romanization = Column(Text)
    example_zh = Column(Text)
    example_en = Column(Text)
    source = Column(String, default="curated", index=True)  # "curated" | "cc-cedict" | "jmdict" | etc.

    language = relationship("Language", back_populates="vocab_items")


class CulturalNote(Base):
    __tablename__ = "cultural_notes"
    id = Column(Integer, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False, index=True)
    title_zh = Column(String, nullable=False)
    title_en = Column(String, nullable=False)
    body_zh = Column(Text, nullable=False)
    body_en = Column(Text, nullable=False)
    region = Column(String)

    language = relationship("Language", back_populates="cultural_notes")


class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vocab_id = Column(Integer, ForeignKey("vocab_items.id"), nullable=False, index=True)
    correct_count = Column(Integer, default=0)
    attempt_count = Column(Integer, default=0)
    next_review = Column(DateTime, default=datetime.utcnow)
    last_reviewed = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")
    vocab_item = relationship("VocabItem")


class QuizSession(Base):
    __tablename__ = "quiz_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_sessions")
    language = relationship("Language")
