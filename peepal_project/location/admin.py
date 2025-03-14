from django.contrib import admin
from .models import Location, Region, LocationCategory, LocationChange, Filter, LocationFilter

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    pass

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    pass

@admin.register(LocationCategory)
class LocationCategoryAdmin(admin.ModelAdmin):
    pass

@admin.register(LocationChange)
class LocationChangeAdmin(admin.ModelAdmin):
    pass

@admin.register(Filter)
class FilterAdmin(admin.ModelAdmin):
    pass

@admin.register(LocationFilter)
class LocationFilterAdmin(admin.ModelAdmin):
    pass
