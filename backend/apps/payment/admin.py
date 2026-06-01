from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from datetime import timedelta
from .models import Subscription, PaymentProof


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'plan', 'status', 'is_active_display', 'start_date', 'end_date']
    list_filter = ['plan', 'status']
    search_fields = ['user__email', 'user__nama_lengkap']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    actions = ['approve_pro', 'approve_team', 'reset_to_free']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email User'

    def is_active_display(self, obj):
        if obj.is_active:
            return format_html('<span style="color:green;font-weight:bold">✓ Aktif</span>')
        return format_html('<span style="color:red;font-weight:bold">✗ Tidak Aktif</span>')
    is_active_display.short_description = 'Aktif'

    @admin.action(description='✅ Upgrade ke Pro (30 hari)')
    def approve_pro(self, request, queryset):
        for sub in queryset:
            sub.plan = Subscription.Plan.PRO
            sub.status = Subscription.Status.ACTIVE
            sub.start_date = timezone.now()
            sub.end_date = timezone.now() + timedelta(days=30)
            sub.save()
        self.message_user(request, f'{queryset.count()} subscription diupgrade ke Pro.')

    @admin.action(description='✅ Upgrade ke Team (30 hari)')
    def approve_team(self, request, queryset):
        for sub in queryset:
            sub.plan = Subscription.Plan.TEAM
            sub.status = Subscription.Status.ACTIVE
            sub.start_date = timezone.now()
            sub.end_date = timezone.now() + timedelta(days=30)
            sub.save()
        self.message_user(request, f'{queryset.count()} subscription diupgrade ke Team.')

    @admin.action(description='🔄 Reset ke Free')
    def reset_to_free(self, request, queryset):
        for sub in queryset:
            sub.plan = Subscription.Plan.FREE
            sub.status = Subscription.Status.ACTIVE
            sub.end_date = None
            sub.save()
        self.message_user(request, f'{queryset.count()} subscription direset ke Free.')


@admin.register(PaymentProof)
class PaymentProofAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'plan', 'amount_display', 'order_id', 'status', 'proof_preview', 'created_at']
    list_filter = ['status', 'plan']
    search_fields = ['user__email', 'user__nama_lengkap', 'order_id']
    readonly_fields = ['id', 'user', 'plan', 'amount', 'order_id', 'proof_image', 'proof_preview_large', 'created_at']
    ordering = ['-created_at']
    actions = ['approve_payment', 'reject_payment']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email User'

    def amount_display(self, obj):
        return f'Rp {obj.amount:,}'.replace(',', '.')
    amount_display.short_description = 'Nominal'

    def proof_preview(self, obj):
        if obj.proof_image:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="height:60px;border:1px solid #ddd;border-radius:4px;" />'
                '</a>',
                obj.proof_image.url, obj.proof_image.url
            )
        return '-'
    proof_preview.short_description = 'Bukti'

    def proof_preview_large(self, obj):
        if obj.proof_image:
            return format_html(
                '<img src="{}" style="max-width:400px;border:1px solid #ddd;" />',
                obj.proof_image.url
            )
        return '-'
    proof_preview_large.short_description = 'Preview Bukti'

    @admin.action(description='✅ Approve — Aktifkan subscription')
    def approve_payment(self, request, queryset):
        plan_map = {'pro': Subscription.Plan.PRO, 'team': Subscription.Plan.TEAM}
        count = 0
        for proof in queryset.filter(status=PaymentProof.Status.PENDING):
            # Update proof status
            proof.status = PaymentProof.Status.APPROVED
            proof.reviewed_at = timezone.now()
            proof.save()

            # Aktifkan subscription
            sub = Subscription.objects.get_or_create(
                user=proof.user,
                defaults={'plan': Subscription.Plan.FREE, 'status': Subscription.Status.ACTIVE}
            )[0]
            sub.plan = plan_map.get(proof.plan, Subscription.Plan.PRO)
            sub.status = Subscription.Status.ACTIVE
            sub.start_date = timezone.now()
            sub.end_date = timezone.now() + timedelta(days=30)
            sub.save()
            count += 1

        self.message_user(request, f'{count} pembayaran diapprove, subscription diaktifkan.')

    @admin.action(description='❌ Reject — Tolak bukti pembayaran')
    def reject_payment(self, request, queryset):
        queryset.filter(status=PaymentProof.Status.PENDING).update(
            status=PaymentProof.Status.REJECTED,
            reviewed_at=timezone.now()
        )
        self.message_user(request, f'{queryset.count()} bukti pembayaran ditolak.')
