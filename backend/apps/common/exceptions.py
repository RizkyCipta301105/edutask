"""
DRF exception handler — wrap default errors in the EduTask API envelope.
"""
from rest_framework import status
from rest_framework.views import exception_handler

from apps.common.utils import error_response


def edutask_exception_handler(exc, context):
    """
  Map DRF/Django exceptions to { success, message, errors }.

  Views that return success_response/error_response directly are unchanged.
  """
    response = exception_handler(exc, context)
    if response is None:
        return None

    status_code = response.status_code
    data = response.data

    if status_code == status.HTTP_404_NOT_FOUND:
        return error_response(
            message='Data tidak ditemukan.',
            status_code=status_code,
        )

    if status_code == status.HTTP_403_FORBIDDEN:
        return error_response(
            message='Anda tidak memiliki izin untuk aksi ini.',
            status_code=status_code,
        )

    if status_code == status.HTTP_401_UNAUTHORIZED:
        detail = data.get('detail') if isinstance(data, dict) else None
        return error_response(
            message=str(detail) if detail else 'Autentikasi diperlukan.',
            status_code=status_code,
        )

    if status_code == status.HTTP_405_METHOD_NOT_ALLOWED:
        return error_response(
            message='Metode HTTP tidak diizinkan.',
            status_code=status_code,
        )

    if isinstance(data, dict):
        if set(data.keys()) == {'detail'}:
            return error_response(
                message=str(data['detail']),
                status_code=status_code,
            )
        return error_response(
            errors=data,
            message='Permintaan tidak valid.',
            status_code=status_code,
        )

    return error_response(
        errors=data,
        message='Terjadi kesalahan.',
        status_code=status_code,
    )
