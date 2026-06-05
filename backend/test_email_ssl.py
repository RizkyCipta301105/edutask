import os
import smtplib
from decouple import config

EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = 465
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

print(f"Mencoba koneksi SSL ke {EMAIL_HOST}:{EMAIL_PORT}...")
try:
    server = smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT, timeout=10)
    server.set_debuglevel(1)
    print("Koneksi SSL berhasil, mencoba login...")
    server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
    print("Login berhasil!")
    server.quit()
except Exception as e:
    print(f"Terjadi error: {e}")
