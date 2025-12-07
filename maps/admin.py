from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from .models import UserLocation, Restaurant

# Register the UserLocation model in the Django admin
# using OSMGeoAdmin, which provides a map widget for GIS fields.
@admin.register(UserLocation)
class UserLocationAdmin(OSMGeoAdmin):
    # Fields that will be shown in the list page of the admin UI
    list_display = ('name',)

# Register the Restaurant model in the Django admin
# also using OSMGeoAdmin for geographic visualization.
@admin.register(Restaurant)
class RestaurantAdmin(OSMGeoAdmin):
    # Display basic restaurant info in the admin list view
    list_display = ('name', 'type', 'delivers')
