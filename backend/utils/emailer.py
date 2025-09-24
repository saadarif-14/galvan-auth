import os
import smtplib
from email.mime.text import MIMEText


def send_email(to_email: str, subject: str, body: str) -> None:
    # Ensure all parameters are strings
    to_email = str(to_email) if to_email else ""
    subject = str(subject) if subject else ""
    body = str(body) if body else ""
    
    host = os.getenv("MAIL_SERVER")
    port = int(os.getenv("MAIL_PORT", "587"))
    username = os.getenv("MAIL_USERNAME")
    password = os.getenv("MAIL_PASSWORD")
    use_tls = os.getenv("MAIL_USE_TLS", "true").lower() == "true"

    if not host or not username or not password:
        # Fallback: print to console in dev
        print(f"[EMAIL MOCK] To: {to_email}\nSubject: {subject}\n\n{body}")
        return

    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = username
        msg["To"] = to_email

        with smtplib.SMTP(host, port) as server:
            if use_tls:
                server.starttls()
            server.login(username, password)
            server.send_message(msg)
    except Exception as e:
        print(f"Email error: {e}")
        # Fallback: print to console in dev
        print(f"[EMAIL MOCK] To: {to_email}\nSubject: {subject}\n\n{body}")
