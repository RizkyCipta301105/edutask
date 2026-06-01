from rest_framework import serializers
from .models import Subscription, PaymentProof


class SubscriptionSerializer(serializers.ModelSerializer):
    features = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'is_active',
            'start_date', 'end_date', 'order_id',
            'features', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_features(self, obj):
        return obj.features


class PaymentProofSerializer(serializers.ModelSerializer):
    proof_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PaymentProof
        fields = [
            'id', 'plan', 'amount', 'status',
            'admin_note', 'proof_image_url',
            'created_at', 'reviewed_at',
        ]
        read_only_fields = fields

    def get_proof_image_url(self, obj):
        if obj.proof_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.proof_image.url)
            return obj.proof_image.url
        return None
