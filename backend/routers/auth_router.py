import os
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth
from email_utils import send_email, smtp_configured

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    username = user_data.username.strip()
    email = user_data.email.strip().lower()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if db.query(models.User).filter(models.User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        username=username,
        email=email,
        hashed_password=auth.get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    login_id = credentials.username.strip()
    user = (
        db.query(models.User)
        .filter(or_(models.User.username == login_id, models.User.email == login_id.lower()))
        .first()
    )
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}


@router.get("/me")
def read_current_user(current_user: models.User = Depends(auth.get_current_user)):
    return {"id": current_user.id, "username": current_user.username, "email": current_user.email}


# ============ FORGOT PASSWORD FLOW ============
CODE_EXPIRY_MIN = 30  # minutes a reset code is valid
ALLOW_DEV_RESET_CODE = os.getenv("ALLOW_DEV_RESET_CODE", "").lower() in {"1", "true", "yes"}


@router.post("/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send a 6-digit verification code to the user's registered email.
    Always returns 200 so attackers can't enumerate valid emails."""
    email = req.email.strip().lower()
    response = {"sent": True}

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Do not reveal that the email is not registered
        return response

    # Invalidate any previous unused codes for this email
    db.query(models.PasswordResetCode).filter(
        models.PasswordResetCode.email == email,
        models.PasswordResetCode.used == False,
    ).update({"used": True}, synchronize_session=False)

    code = f"{random.randint(0, 999999):06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=CODE_EXPIRY_MIN)
    db.add(models.PasswordResetCode(email=email, code=code, expires_at=expires_at))
    db.commit()

    subject = "LangLearn · 密码重置验证码"
    body = (
        f"Hi {user.username},\n\n"
        f"你正在重置 LangLearn 账户的密码。验证码是：\n\n"
        f"    {code}\n\n"
        f"验证码 {CODE_EXPIRY_MIN} 分钟内有效。如果你没有申请重置密码，请忽略此邮件。\n\n"
        f"—\nLangLearn 多语言学习平台\n"
    )
    ok, detail = send_email(email, subject, body)

    # Local-only escape hatch for development. Do not enable this in production.
    if not smtp_configured() and ALLOW_DEV_RESET_CODE:
        response["dev_code"] = code
        response["dev_note"] = "SMTP not configured — code printed to server console. Set SMTP_* env vars for real email delivery."
    elif not ok:
        response["email_sent"] = False

    return response


@router.post("/reset-password")
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    code = req.code.strip()
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    record = (
        db.query(models.PasswordResetCode)
        .filter(
            models.PasswordResetCode.email == email,
            models.PasswordResetCode.code == code,
            models.PasswordResetCode.used == False,
            models.PasswordResetCode.expires_at > datetime.utcnow(),
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=400, detail="验证码错误或已过期 / Invalid or expired code")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.hashed_password = auth.get_password_hash(req.new_password)
    record.used = True
    db.commit()
    return {"message": "Password reset successful"}
