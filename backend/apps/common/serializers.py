"""
Base serializers and mixins for common validation logic
"""
from rest_framework import serializers
from django.utils import timezone


class DatetimeValidationMixin:
    """
    Mixin for common date/datetime validation.
    Provides reusable deadline validation.
    """
    
    def validate_deadline(self, value):
        """
        Validate that deadline is not in the past (only on creation).
        Used in task serializers.
        """
        # Only validate on creation (when self.instance is None)
        if self.instance is None and value < timezone.now().date():
            raise serializers.ValidationError(
                'Deadline tidak boleh di masa lalu.'
            )
        return value


class OwnershipValidationMixin:
    """
    Mixin for validating resource ownership (user-related resources).
    Ensures users can only access their own resources.
    """
    
    def validate_resource_owner(self, value, resource_name='Resource'):
        """
        Validate that a related resource belongs to the authenticated user.
        
        Args:
            value: The resource object to validate
            resource_name: Name of the resource for error message
        
        Returns:
            The validated value
        """
        if value is None:
            return value
        
        request = self.context.get('request')
        if request and hasattr(value, 'user') and value.user != request.user:
            raise serializers.ValidationError(
                f'{resource_name} tidak ditemukan.'
            )
        
        return value
