from django.urls import path
from .views import LocationListCreateAPIView

urlpatterns = [
    path('location/', LocationListCreateAPIView.as_view(), name='location-list-create'),
]