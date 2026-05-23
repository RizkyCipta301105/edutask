import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edutask_core.settings")
django.setup()

from apps.authentication.models import User
from django.test import RequestFactory
from apps.tasks.views import PenugasanReportView

user = User.objects.get(email="ciptarizky@pens.ac.id")
request = RequestFactory().get('/api/tasks/penugasan/report/')
request.user = user

response = PenugasanReportView.as_view()(request)
print("Status:", response.status_code)
print("Data:", response.data)
