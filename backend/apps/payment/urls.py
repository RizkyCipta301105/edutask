from django.urls import path
from .views import (
    MySubscriptionView,
    CreateInvoiceView,
    CheckInvoiceView,
    PaymentWebhookView,
    SubmitProofView,
    MyPaymentProofsView,
)

urlpatterns = [
    # Subscription status
    path('subscription/', MySubscriptionView.as_view(), name='my-subscription'),

    # Bayarin integration — buat invoice & cek status
    path('create-invoice/', CreateInvoiceView.as_view(), name='create-invoice'),
    path('check-invoice/', CheckInvoiceView.as_view(), name='check-invoice'),

    # Webhook dari Bayarin (public, no auth)
    path('webhook/', PaymentWebhookView.as_view(), name='payment-webhook'),

    # Fallback: upload bukti manual
    path('submit-proof/', SubmitProofView.as_view(), name='submit-proof'),

    # Riwayat pengajuan milik user
    path('proofs/', MyPaymentProofsView.as_view(), name='my-payment-proofs'),
]
