"""Email delivery utility. Uses SMTP if configured, otherwise prints to console
so local development works without any setup."""
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr
from typing import Tuple

# Load variables from a .env file in the project root, if present.
try:
    from dotenv import load_dotenv
    # Look for .env two levels up: backend/routers/.. -> backend/.. -> project root
    _here = os.path.dirname(os.path.abspath(__file__))
    for candidate in (
        os.path.join(_here, ".env"),
        os.path.join(_here, "..", ".env"),
    ):
        if os.path.exists(candidate):
            load_dotenv(candidate, override=False)
            break
except ImportError:
    pass

# Read SMTP config from environment variables.
# Common providers:
#   QQ Mail:    SMTP_HOST=smtp.qq.com       SMTP_PORT=465  (use an app authorization code, not account password)
#   163 Mail:   SMTP_HOST=smtp.163.com      SMTP_PORT=465
#   Gmail:      SMTP_HOST=smtp.gmail.com    SMTP_PORT=587  (requires app password)
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASS = os.getenv("SMTP_PASS", "").strip()
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER).strip()
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "LangLearn 多语言学习").strip()


def smtp_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_FROM)


def send_email(to_addr: str, subject: str, body: str) -> Tuple[bool, str]:
    """Send plaintext email. Returns (success, detail)."""
    if not smtp_configured():
        # Fallback: log to console so dev can proceed without SMTP setup
        print("\n" + "=" * 60)
        print(f"[EMAIL] SMTP not configured — would send to {to_addr}")
        print(f"[EMAIL] Subject: {subject}")
        print(f"[EMAIL] {body}")
        print("=" * 60 + "\n")
        return False, "console-only"

    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = Header(subject, "utf-8")
        msg["From"] = formataddr((Header(SMTP_FROM_NAME, "utf-8").encode(), SMTP_FROM))
        msg["To"] = to_addr

        if SMTP_PORT == 465:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=15) as s:
                s.login(SMTP_USER, SMTP_PASS)
                s.sendmail(SMTP_FROM, [to_addr], msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as s:
                s.ehlo()
                s.starttls(context=ssl.create_default_context())
                s.login(SMTP_USER, SMTP_PASS)
                s.sendmail(SMTP_FROM, [to_addr], msg.as_string())
        print(f"[EMAIL] Sent to {to_addr}: {subject}")
        return True, "sent"
    except Exception as e:
        print(f"[EMAIL] Send failed to {to_addr}: {e}")
        return False, str(e)
