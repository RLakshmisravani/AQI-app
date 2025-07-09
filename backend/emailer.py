import smtplib
import os
from dotenv import load_dotenv
load_dotenv()
from email.mime.text import MIMEText
import sqlite3
from config import DB_PATH  # ✅ Centralized DB path

# 🔐 Securely configure your email and app password
SENDER_EMAIL = os.getenv("EMAIL_USER")
APP_PASSWORD = os.getenv("EMAIL_PASSWORD")  # ✅ Replace with your Gmail App Password

# 🔹 Generic email sender
def send_email(to, subject, body):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = to

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, [to], msg.as_string())
    except Exception as e:
        print(f"❌ Failed to send email to {to}: {e}")

# 🔹 Alert all users in a city when AQI rises
def send_alerts_for_city(city, forecast_aqi):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT email FROM users WHERE lower(city) = ?", (city.lower(),))
    users = c.fetchall()
    conn.close()

    for (email,) in users:
        send_email(
            email,
            f"AQI Alert for {city}",
            f"""Hello,

The AQI forecast for your city ({city}) is **{forecast_aqi:.2f}**, which may pose health risks.

Health Recommendations:
• Limit outdoor exposure
• Wear a mask when stepping out
• Stay indoors as much as possible
• Use air purifiers if available

Stay safe,  
AQI Insight Team"""
        )

# 🔹 Send welcome email to new users
def send_welcome_email(to, name):
    body = f"""Hi {name},

Welcome to AQI Insight!

You're now subscribed to receive personalized AQI updates and health alerts for your city.

Stay informed, stay safe.

Best regards,  
AQI Insight Team
"""
    send_email(to, "Welcome to AQI Insight!", body)
