# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Antennas(models.Model):
    antenna_id = models.AutoField(primary_key=True)
    reader = models.ForeignKey('Readers', models.DO_NOTHING)
    port_number = models.IntegerField()
    orientation = models.CharField(max_length=80, blank=True, null=True)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'antennas'
        unique_together = (('reader', 'port_number'),)


class Detections(models.Model):
    detection_id = models.BigAutoField(primary_key=True)
    epc = models.CharField(max_length=120)
    reader = models.ForeignKey('Readers', models.DO_NOTHING)
    antenna = models.ForeignKey(Antennas, models.DO_NOTHING, blank=True, null=True)
    rssi = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    phase_angle = models.DecimalField(max_digits=7, decimal_places=3, blank=True, null=True)
    frequency_mhz = models.DecimalField(max_digits=8, decimal_places=3, blank=True, null=True)
    detected_at = models.DateTimeField()
    project = models.ForeignKey('Projects', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'detections'


class Groups(models.Model):
    group_id = models.AutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=120)
    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'groups'


'''class ItemGroups(models.Model):
    pk = models.CompositePrimaryKey('item_id', 'group_id')
    item = models.ForeignKey('Items', models.DO_NOTHING)
    group = models.ForeignKey(Groups, models.DO_NOTHING)
    added_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'item_groups'''

class ItemGroups(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")  # you already added this via SQL
    item = models.ForeignKey('Items', on_delete=models.CASCADE, db_column='item_id')
    group = models.ForeignKey('Groups', on_delete=models.CASCADE, db_column='group_id')
    added_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False                 # <- important: Django won't try to CREATE/ALTER this table
        db_table = 'item_groups'
        unique_together = (('item', 'group'),)
        verbose_name = 'Item Group'
        verbose_name_plural = 'Item Groups'




'''class ItemProjects(models.Model):
    pk = models.CompositePrimaryKey('item_id', 'project_id')
    item = models.ForeignKey('Items', models.DO_NOTHING)
    project = models.ForeignKey('Projects', models.DO_NOTHING)
    assigned_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'item_projects'
'''
class ItemProjects(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")  # also added via SQL
    item = models.ForeignKey('Items', on_delete=models.CASCADE, db_column='item_id')
    project = models.ForeignKey('Projects', on_delete=models.CASCADE, db_column='project_id')
    assigned_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'item_projects'
        unique_together = (('item', 'project'),)
        verbose_name = 'Item Project'
        verbose_name_plural = 'Item Projects'

class Items(models.Model):
    item_id = models.AutoField(primary_key=True)
    project = models.ForeignKey('Projects', models.DO_NOTHING, blank=True, null=True)
    label = models.ForeignKey('Labels', models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length=160)
    tag_id = models.CharField(unique=True, max_length=120)
    epc = models.CharField(unique=True, max_length=128, blank=True, null=True)
    type = models.CharField(max_length=80, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    storage_location = models.ForeignKey('StorageLocations', models.DO_NOTHING, blank=True, null=True)
    status = models.CharField(max_length=11, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'items'


class Labels(models.Model):
    label_id = models.AutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=120)
    tag_type = models.CharField(max_length=60, blank=True, null=True)
    printed_by = models.ForeignKey('Users', models.DO_NOTHING, db_column='printed_by', blank=True, null=True)
    printed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'labels'


class Logs(models.Model):
    log_id = models.BigAutoField(primary_key=True)
    item = models.ForeignKey(Items, models.DO_NOTHING, blank=True, null=True)
    action = models.CharField(max_length=8)
    actor_user = models.ForeignKey('Users', models.DO_NOTHING, blank=True, null=True)
    reader = models.ForeignKey('Readers', models.DO_NOTHING, blank=True, null=True)
    note = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'logs'


class Organizations(models.Model):
    org_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    address = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'organizations'


class ProjectUsers(models.Model):
    pk = models.CompositePrimaryKey('project_id', 'user_id')
    project = models.ForeignKey('Projects', models.DO_NOTHING)
    user = models.ForeignKey('Users', models.DO_NOTHING)
    role = models.ForeignKey('Roles', models.DO_NOTHING)
    added_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'project_users'


class Projects(models.Model):
    project_id = models.AutoField(primary_key=True)
    org = models.ForeignKey(Organizations, models.DO_NOTHING)
    code = models.CharField(unique=True, max_length=40)
    name = models.CharField(max_length=160)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'projects'


class Readers(models.Model):
    reader_id = models.AutoField(primary_key=True)
    model = models.CharField(max_length=120, blank=True, null=True)
    serial_number = models.CharField(unique=True, max_length=120, blank=True, null=True)
    mac_address = models.CharField(max_length=50, blank=True, null=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    installation_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=160, blank=True, null=True)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'readers'


class Roles(models.Model):
    role_id = models.AutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=60)

    class Meta:
        managed = False
        db_table = 'roles'


class StorageLocations(models.Model):
    storage_location_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'storage_locations'


class Users(models.Model):
    user_id = models.AutoField(primary_key=True)
    org = models.ForeignKey(Organizations, models.DO_NOTHING)
    name = models.CharField(max_length=120)
    email = models.CharField(unique=True, max_length=150)
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'




class RfidItemsTemp(models.Model):
    id = models.AutoField(primary_key=True)
    epc = models.CharField(max_length=255, blank=True, null=True)
    barcode = models.CharField(max_length=255, blank=True, null=True)
    item_name = models.CharField(max_length=255, blank=True, null=True)
    project_name = models.CharField(max_length=255, blank=True, null=True)
    responsible_person = models.CharField(max_length=255, blank=True, null=True)
    organization = models.CharField(max_length=255, blank=True, null=True)
    storage_location = models.CharField(max_length=255, blank=True, null=True)
    checkby_date = models.DateField(blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False  # database controls table, not Django migrations
        db_table = 'rfid_items_temp'
        verbose_name = "RFID Imported Item"
        verbose_name_plural = "RFID Imported Items"
