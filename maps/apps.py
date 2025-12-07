from django.apps import AppConfig

# Configuration class for the "maps" Django app.
# Django automatically loads this when the app is included in INSTALLED_APPS.
class MapsConfig(AppConfig):
    # Sets the default primary key type for models in this app
    # to BigAutoField (a 64-bit integer).
    default_auto_field = 'django.db.models.BigAutoField'

    # The name of the app — must match the folder name.
    name = 'maps'
