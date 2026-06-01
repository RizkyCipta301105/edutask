import uuid
from django.db import models
from django.utils import timezone


class Subscription(models.Model):

    class Plan(models.TextChoices):
        FREE = 'free', 'Free'
        PRO = 'pro', 'Pro'
        TEAM = 'team', 'Team'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        EXPIRED = 'expired', 'Expired'
        CANCELLED = 'cancelled', 'Cancelled'
        PENDING = 'pending', 'Pending'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='subscription'
    )
    plan = models.CharField(max_length=10, choices=Plan.choices, default=Plan.FREE)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    order_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'

    def __str__(self):
        return f"{self.user.email} — {self.plan} ({self.status})"

    @property
    def is_active(self):
        if self.status != self.Status.ACTIVE:
            return False
        if self.end_date and timezone.now() > self.end_date:
            return False
        return True

    @property
    def features(self):
        base = {
            'kanban': True,
            'calendar': True,
            'notifications': True,
            'ruang_edukasi': False,
            'inbox': False,
            'broadcast': False,
            'analytics': False,
            'export_csv': False,
            'multiple_ruang': False,
            'max_members': 1,
        }
        if not self.is_active:
            return base
        if self.plan in (self.Plan.PRO, self.Plan.TEAM):
            base.update({
                'ruang_edukasi': True,
                'inbox': True,
                'broadcast': True,
                'analytics': True,
                'export_csv': True,
            })
        if self.plan == self.Plan.TEAM:
            base.update({'multiple_ruang': True, 'max_members': 10})
        return base


class PaymentProof(models.Model):
    """Bukti transfer yang diupload user, diverifikasi admin."""

    class Status(models.TextChoices):
        PENDING  = 'pending',  'Menunggu Verifikasi'
        APPROVED = 'approved', 'Disetujui'
        REJECTED = 'rejected', 'Ditolak'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='payment_proofs'
    )
    plan = models.CharField(max_length=10)
    amount = models.IntegerField()
    # order_id: invoice_id dari Bayarin (kosong jika upload manual)
    order_id = models.CharField(max_length=100, blank=True, db_index=True)
    proof_image = models.ImageField(upload_to='payment_proofs/', null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    admin_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payment_proofs'
        verbose_name = 'Bukti Pembayaran'
        verbose_name_plural = 'Bukti Pembayaran'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} — {self.plan} — {self.status}"
