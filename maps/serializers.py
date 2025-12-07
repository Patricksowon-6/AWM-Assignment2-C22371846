from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import UserLocation, Restaurant

# Serializer for UserLocation model that outputs GeoJSON features.
# GeoFeatureModelSerializer automatically formats the output as:
# {
#   "type": "Feature",
#   "geometry": { ... },
#   "properties": { ... }
# }
class UserLocationSerializer(GeoFeatureModelSerializer):
    class Meta:
        # Model to serialize
        model = UserLocation

        # Field that contains the geometry (PointField)
        geo_field = 'location'

        # Fields included in the GeoJSON "properties" + "geometry"
        fields = ('id', 'name', 'location')


# Serializer for Restaurant model, also outputting GeoJSON features.
class RestaurantSerializer(GeoFeatureModelSerializer):
    class Meta:
        # Model to serialize
        model = Restaurant

        # Geometry field for GeoJSON
        geo_field = 'location'

        # All fields included in the output
        fields = ('id', 'name', 'type', 'location', 'delivers')
