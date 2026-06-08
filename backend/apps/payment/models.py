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

    # ── Batas workspace proyek per plan ──────────────────────────────────────
    # Ruang Edukasi (is_workspace=False) untuk mahasiswa & dosen: UNLIMITED di semua plan.
    # Workspace Proyek (is_workspace=True): dibatasi sesuai plan di bawah.
    WORKSPACE_LIMITS = {
        Plan.FREE:  {'max_workspace': 1,  'max_members_per_workspace': 3},
        Plan.PRO:   {'max_workspace': 5,  'max_members_per_workspace': 7},
        Plan.TEAM:  {'max_workspace': None, 'max_members_per_workspace': 30},  # None = unlimited
    }

    @property
    def features(self):
        plan_key = self.plan if self.plan in (self.Plan.FREE, self.Plan.PRO, self.Plan.TEAM) else self.Plan.FREE
        limits = self.WORKSPACE_LIMITS.get(plan_key, self.WORKSPACE_LIMITS[self.Plan.FREE])

        base = {
            # ── Fitur dasar (semua plan) ───────────────────────────────────
            'kanban': True,
            'calendar': True,
            'notifications': True,

            # ── Ruang Edukasi: FREE untuk mahasiswa & dosen (logika di view) ──
            # Field ini hanya menandai apakah plan mendukung inbox/broadcast/analytics
            'inbox': False,
            'broadcast': False,
            'analytics': False,
            'export_csv': False,

            # ── Batas workspace proyek ──────────────────────────────────────
            'max_workspace': limits['max_workspace'],               # None = unlimited
            'max_members_per_workspace': limits['max_members_per_workspace'],
        }

        if not self.is_active:
            # Saat expired/cancelled → turunkan ke limit FREE
            base['max_workspace'] = self.WORKSPACE_LIMITS[self.Plan.FREE]['max_workspace']
            base['max_members_per_workspace'] = self.WORKSPACE_LIMITS[self.Plan.FREE]['max_members_per_workspace']
            return base

        if self.plan in (self.Plan.PRO, self.Plan.TEAM):
            base.update({
                'inbox': True,
                'broadcast': True,
                'analytics': True,
                'export_csv': True,
            })

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
