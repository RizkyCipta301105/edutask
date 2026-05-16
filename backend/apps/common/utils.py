"""
Common utilities for EduTask backend
Centralized response helpers, validators, and business logic helpers
"""
from rest_framework import status
from rest_framework.response import Response


# ════════════════════════════════════════════════════════════════════════════
#  RESPONSE HELPERS
# ════════════════════════════════════════════════════════════════════════════

def success_response(data=None, message='', status_code=status.HTTP_200_OK):
    """
    Return standardized success response.
    
    Args:
        data: Response payload
        message: User-friendly success message
        status_code: HTTP status code (default: 200)
    
    Returns:
        Response with structure: {'success': True, 'message': str, 'data': any}
    """
    return Response(
        {
            'success': True,
            'message': message,
            'data': data,
        },
        status=status_code
    )


def error_response(errors=None, message='Terjadi kesalahan.', status_code=status.HTTP_400_BAD_REQUEST):
    """
    Return standardized error response.

    Args:
        errors: Error details (dict or list)
        message: User-friendly error message
        status_code: HTTP status code (default: 400)

    Returns:
        Response with structure: {'success': False, 'message': str, 'errors': any}
    """
    return Response(
        {
            'success': False,
            'message': message,
            'errors': errors,
        },
        status=status_code,
    )


def validation_error_response(errors, message='Data tidak valid. Periksa kembali input Anda.'):
    """Serializer / field validation failures (HTTP 422)."""
    return error_response(
        errors=errors,
        message=message,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )


# ════════════════════════════════════════════════════════════════════════════
#  SERIALIZER VALIDATION HELPERS
# ════════════════════════════════════════════════════════════════════════════

def validate_resource_ownership(value, request, resource_name='Resource'):
    """
    Generic validator to check if a related resource belongs to the authenticated user.
    
    Args:
        value: The resource object to validate
        request: The request object containing user info
        resource_name: Name of the resource for error message
    
    Returns:
        The validated value
    
    Raises:
        serializers.ValidationError if resource doesn't belong to user
    """
    from rest_framework import serializers
    
    if value is None:
        return value
    
    if hasattr(value, 'user') and value.user != request.user:
        raise serializers.ValidationError(f'{resource_name} tidak ditemukan.')
    
    return value
