from django.contrib import admin
from . import models

# ---- General Admin Site Settings ----
admin.site.site_header = "RFID Management Dashboard"
admin.site.site_title = "RFID Admin Portal"
admin.site.index_title = "Welcome to the RFID Admin"


# ---- Base Admin Class for all tables ----
class DefaultAdmin(admin.ModelAdmin):
    list_per_page = 25
    search_help_text = "Search by any text field"
    save_on_top = True

    def get_list_display(self, request):
        # Show all fields (columns) in admin list
        return [field.name for field in self.model._meta.fields]

    def get_ordering(self, request):
        # Dynamically pick the first field (usually PK) for ordering
        pk_field = self.model._meta.pk.name
        return (f'-{pk_field}',)

    def get_search_fields(self, request):
        # Auto-search across text fields
        return [
            field.name for field in self.model._meta.fields
            if field.get_internal_type() in ['CharField', 'TextField']
        ]

    def get_list_filter(self, request):
        # Auto-add fields for filtering if they look like foreign keys or statuses
        return [
            field.name for field in self.model._meta.fields
            if field.name.endswith('_id') or field.name in ['status']
        ]


# ---- Register all models dynamically ----
for model in [
    models.Users,
    models.Roles,
    models.Projects,
    models.Organizations,
    models.Labels,
    models.Items,
    models.Logs,
    models.Readers,
    models.Antennas,
    models.Detections,
    models.StorageLocations,
    models.ItemGroups,
    models.ItemProjects,
    models.RfidItemsTemp,
]:
    try:
        admin.site.register(model, DefaultAdmin)
    except admin.sites.AlreadyRegistered:
        pass
