import os
import smtplib
from decouple import config

# Membaca .env
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

print(f"Mencoba koneksi ke {EMAIL_HOST}:{EMAIL_PORT}...")
print(f"Menggunakan email: {EMAIL_HOST_USER}")
try:
    server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=10)
    server.set_debuglevel(1)
    print("Koneksi berhasil, mencoba STARTTLS...")
    server.starttls()
    print("STARTTLS berhasil, mencoba login...")
    server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
    print("Login berhasil!")
    server.quit()
except Exception as e:
    print(f"Terjadi error: {e}")
