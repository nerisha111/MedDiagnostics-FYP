# backend_project/urls.py

from django.contrib import admin
from django.urls import path, include # Make sure 'include' is imported

urlpatterns = [
    # The Django admin site
    path('admin/', admin.site.urls),

    # This is the crucial line:
    # It tells Django that any URL starting with 'api/' should be
    # handled by the url patterns defined in 'api/urls.py'.
    path('api/', include('api.urls')),
]