from django.db import models


class Region(models.Model):
    region_name = models.CharField(max_length=100, unique=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    def __str__(self):
        return self.region_name
    
    class Meta:
        db_table = "region"


class LocationCategory(models.Model):
    category_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.category_name
    
    class Meta:
        db_table = "location_category"


class Location(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    category = models.ForeignKey(LocationCategory, on_delete=models.CASCADE)
    address = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.address
    
    class Meta:
        db_table = "location"


class LocationChange(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    field_name = models.CharField(max_length=50)
    old_value = models.JSONField()
    new_value = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    moderator = models.ForeignKey('user.User', on_delete=models.SET_NULL, null=True, related_name='moderator')
    moderator_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "location_change"


class Filter(models.Model):
    filter_name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(LocationCategory, on_delete=models.CASCADE)

    def __str__(self):
        return self.filter_name
    
    class Meta:
        db_table = "filter"


class LocationFilter(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    filter = models.ForeignKey(Filter, on_delete=models.CASCADE)

    class Meta:
        db_table = "location_filter"
