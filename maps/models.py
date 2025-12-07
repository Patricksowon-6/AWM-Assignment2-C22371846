from django.contrib.gis.db import models

# Model representing a user's saved location on the map.
class UserLocation(models.Model):
    # Name or label for the location
    name = models.CharField(max_length=100)

    # Geographic point (latitude/longitude) using WGS84 (SRID 4326)
    location = models.PointField(srid=4326)

    # String representation shown in Django admin and shell
    def __str__(self):
        return self.name


# Model representing a restaurant and its spatial location.
class Restaurant(models.Model):
    # Restaurant name
    name = models.CharField(max_length=100)

    # Category/type of restaurant (e.g., “Italian”, “Fast Food”)
    type = models.CharField(max_length=50)

    # GeoPoint storing restaurant coordinates in WGS84
    location = models.PointField(srid=4326)

    # Whether the restaurant offers delivery services
    delivers = models.BooleanField(default=False)

    # String representation for admin and shell views
    def __str__(self):
        return self.name
