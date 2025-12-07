from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import UserLocation, Restaurant
from .serializers import UserLocationSerializer, RestaurantSerializer


# ---------------------------------------
# Main page view
# ---------------------------------------
# Renders the main map template. This is the UI where
# the user interacts with markers, search, etc.
def hello_map(request):
    return render(request, 'maps/hello_map.html')


# ---------------------------------------
# REST API ViewSets
# ---------------------------------------
# Provides CRUD API endpoints for UserLocation:
# list, retrieve, create, update, delete.
class UserLocationViewSet(viewsets.ModelViewSet):
    queryset = UserLocation.objects.all()
    serializer_class = UserLocationSerializer


# Provides CRUD API endpoints for Restaurant.
class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer


# ---------------------------------------
# Nearby Restaurants Endpoint
# ---------------------------------------
# Accepts GET parameters:
#   lat – user's latitude
#   lng – user's longitude
#   max_distance – search radius (default: 5000m)
#
# Returns all restaurants within the given distance,
# sorted by nearest first.
@api_view(['GET'])
def nearby_restaurants(request):
    # Ensure valid latitude/longitude provided
    try:
        lat = float(request.GET.get('lat'))
        lng = float(request.GET.get('lng'))
    except (TypeError, ValueError):
        return Response({"error": "Invalid coordinates"}, status=400)

    # Create a geographic point with WGS84 (lat/lng)
    # Note: Point expects order (x, y) = (lng, lat)
    user_location = Point(lng, lat, srid=4326)

    # Maximum distance in meters; default = 5 km
    max_distance = float(request.GET.get('max_distance', 5000))

    # Compute distance using PostGIS and filter nearby restaurants
    nearby = (
        Restaurant.objects.annotate(distance=Distance('location', user_location))
        .filter(distance__lte=max_distance)
        .order_by('distance')  # sort nearest first
    )

    # Serialize and return GeoJSON-like API output
    serializer = RestaurantSerializer(nearby, many=True)
    return Response(serializer.data)
