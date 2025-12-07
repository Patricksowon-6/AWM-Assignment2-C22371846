from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserLocationViewSet, RestaurantViewSet, nearby_restaurants
from . import views

# Router automatically creates RESTful routes for viewsets:
# /api/user-locations/
# /api/user-locations/<id>/
# /api/restaurants/
# /api/restaurants/<id>/
router = DefaultRouter()
router.register(r'user-locations', UserLocationViewSet)
router.register(r'restaurants', RestaurantViewSet)

urlpatterns = [
    # Include all automatically generated API routes
    path('api/', include(router.urls)),             

    # Main webpage that displays the map (likely a frontend template)
    path('', views.hello_map, name='hello_map'),

    # Custom API endpoint for nearby restaurant search
    # e.g., /api/restaurants/nearby/?lat=...&lng=...&radius=...
    path('api/restaurants/nearby/', nearby_restaurants, name='nearby-restaurants'),
]
