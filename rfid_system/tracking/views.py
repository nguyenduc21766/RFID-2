from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from datetime import timedelta
from zoneinfo import ZoneInfo
import json

from .models import Readers, Antennas, Detections, RfidItemsTemp


# ----------------------------------------------------------------------
# BASIC VIEW
# ----------------------------------------------------------------------

def home(request):
    return render(request, 'tracking/index.html')


# ----------------------------------------------------------------------
# HELPERS
# ----------------------------------------------------------------------

def _compute_status(last_seen, now=None):
    """Translate last_seen timestamp into tag state."""
    now = now or timezone.now()
    diff = now - last_seen

    if diff <= timedelta(minutes=15):
        return "active"
    if diff <= timedelta(hours=2):
        return "idle"
    return "missing"


def _user_to_json(user):
    """Serialize user info for frontend."""
    role = "admin" if user.is_superuser else "staff"
    return {"username": user.username, "role": role}


# ----------------------------------------------------------------------
# RFID LIVE SUMMARY
# ----------------------------------------------------------------------

@csrf_exempt
def rfid_live_summary(request):
    """
    Return human-readable summaries of the last 5 minutes of detections.
    Only includes EPCs listed in rfid_items_temp.
    """
    now = timezone.now()
    valid_epcs = set(RfidItemsTemp.objects.values_list("epc", flat=True))

    recent_detections = (
        Detections.objects
        .select_related("reader", "antenna")
        .filter(
            detected_at__gte=now - timedelta(minutes=5),
            epc__in=valid_epcs
        )
        .order_by("-detected_at")
    )

    summaries = []
    finland_tz = ZoneInfo("Europe/Helsinki")

    for d in recent_detections:
        local_time = d.detected_at.astimezone(finland_tz).strftime("%Y-%m-%d %H:%M:%S")
        summaries.append(
            f"Received EPC: {d.epc} | Reader: {d.reader.model} | "
            f"Antenna: {d.antenna.port_number} | RSSI: {d.rssi} | "
            f"MAC: {d.reader.mac_address} | Local Time (Finland): {local_time}"
        )

    return JsonResponse({"summary": summaries})


# ----------------------------------------------------------------------
# RFID READ (Incoming POST from reader)
# ----------------------------------------------------------------------

@csrf_exempt
def rfid_read(request):
    """Receive RFID tag reads and store detections for registered EPCs."""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        mac = data.get("mac_address")
        tag_reads = data.get("tag_reads", [])

        if not mac or not tag_reads:
            return JsonResponse({"error": "Invalid data"}, status=400)

        reader = Readers.objects.get(mac_address=mac)
        valid_epcs = set(RfidItemsTemp.objects.values_list("epc", flat=True))

        saved, ignored = [], []

        for tag in tag_reads:
            epc = tag.get("epc")

            if epc not in valid_epcs:
                ignored.append(epc)
                continue

            antenna_port = tag.get("antennaPort")
            rssi = tag.get("peakRssi")
            detected_time = timezone.now()

            antenna = Antennas.objects.get(reader=reader, port_number=antenna_port)

            # 5 second deduplication
            if not Detections.objects.filter(
                epc=epc,
                detected_at__gt=detected_time - timedelta(seconds=5)
            ).exists():
                with transaction.atomic():
                    Detections.objects.create(
                        epc=epc,
                        reader=reader,
                        antenna=antenna,
                        rssi=rssi,
                        detected_at=detected_time,
                        project_id=None
                    )
                saved.append(epc)

        return JsonResponse({"status": "ok", "saved_epcs": saved, "ignored_epcs": ignored}, status=201)

    except Readers.DoesNotExist:
        return JsonResponse({"error": "Unknown reader MAC address"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ----------------------------------------------------------------------
# COMBINED CONNECT ENDPOINT
# ----------------------------------------------------------------------

@csrf_exempt
def connect(request):
    """Handle Impinj Speedway Connect: process read + return live summary."""
    read_response = rfid_read(request)
    live_summary = rfid_live_summary(request)

    try:
        data = {
            "status": json.loads(read_response.content).get("status", "ok"),
            "saved_epcs": json.loads(read_response.content).get("saved_epcs", []),
            "summary": json.loads(live_summary.content).get("summary", []),
        }

        print("\n=== RFID CONNECT RESPONSE DEBUG ===")
        print(json.dumps(data, indent=4))
        print("==================================\n")

        return JsonResponse(data)

    except Exception:
        return read_response


# ----------------------------------------------------------------------
# CLEAR DETECTIONS
# ----------------------------------------------------------------------

@csrf_exempt
def clear_detections(request):
    """Delete all detections (testing only)."""
    Detections.objects.all().delete()
    return JsonResponse({"status": "cleared"})


# ----------------------------------------------------------------------
# DASHBOARD: LIVE TAGS
# ----------------------------------------------------------------------

@csrf_exempt
def api_dashboard_live_tags(request):
    """Return recent detections grouped by EPC for React Dashboard."""
    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status=405)

    now = timezone.now()
    tz = ZoneInfo("Europe/Helsinki")

    items_by_epc = {
        row.epc: row
        for row in RfidItemsTemp.objects.exclude(epc__isnull=True).exclude(epc="")
    }

    recent = (
        Detections.objects
        .select_related("reader", "antenna")
        .filter(
            detected_at__gte=now - timedelta(hours=24),
            epc__in=list(items_by_epc.keys())
        )
        .order_by("epc", "-detected_at")
    )

    tags = {}

    for det in recent:
        epc = det.epc
        item = items_by_epc.get(epc)
        last_local = det.detected_at.astimezone(tz)

        if epc not in tags:
            tags[epc] = {
                "id": epc,
                "epc": epc,
                "objectName": getattr(item, "item_name", "") or "",
                "reader": det.reader.model or "",
                "antenna": det.antenna.port_number if det.antenna else None,
                "rssi": float(det.rssi) if det.rssi is not None else None,
                "mac": det.reader.mac_address or "",
                "lastSeen": last_local.isoformat(),
                "status": _compute_status(det.detected_at, now),
                "activityLog": [],
            }

        if len(tags[epc]["activityLog"]) < 20:
            tags[epc]["activityLog"].append({
                "timestamp": last_local.isoformat(),
                "reader": det.reader.model or "",
                "antenna": det.antenna.port_number if det.antenna else None,
                "rssi": float(det.rssi) if det.rssi is not None else None,
            })

    return JsonResponse({"tags": list(tags.values())})


# ----------------------------------------------------------------------
# ITEM SEARCH
# ----------------------------------------------------------------------

@csrf_exempt
def api_item_search(request):
    """Search for an item and return details + movement timeline."""
    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status=405)

    q = (request.GET.get("q") or "").strip()
    if not q:
        return JsonResponse({"error": "Missing query 'q'"}, status=400)

    try:
        item = RfidItemsTemp.objects.get(
            Q(epc__iexact=q) |
            Q(barcode__iexact=q) |
            Q(item_name__icontains=q)
        )
    except RfidItemsTemp.DoesNotExist:
        return JsonResponse({"found": False}, status=404)

    now = timezone.now()
    tz = ZoneInfo("Europe/Helsinki")

    detections = (
        Detections.objects
        .select_related("reader", "antenna")
        .filter(epc=item.epc)
        .order_by("-detected_at")[:50]
    )

    if detections:
        latest = detections[0]
        status = _compute_status(latest.detected_at, now)
        location = f"{latest.reader.location or 'Unknown'} - {latest.reader.model or ''}".strip(" -")
    else:
        status = "missing"
        location = item.storage_location or "Unknown"

    timeline = [{
        "timestamp": d.detected_at.astimezone(tz).isoformat(),
        "location": d.reader.location or "",
        "reader": d.reader.model or "",
        "antenna": d.antenna.port_number if d.antenna else None,
    } for d in detections]

    return JsonResponse({
        "found": True,
        "item": {
            "epc": item.epc,
            "objectName": item.item_name or "",
            "responsiblePerson": item.responsible_person or "",
            "currentLocation": location,
            "status": status,
            "timeline": timeline,
        },
    })


# ----------------------------------------------------------------------
# READER STATUS
# ----------------------------------------------------------------------

@csrf_exempt
def api_reader_status(request):
    """Return status information for all RFID readers."""
    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status=405)

    now = timezone.now()
    online_cutoff = now - timedelta(minutes=5)
    stats_cutoff = now - timedelta(hours=24)

    readers_payload = []

    for r in Readers.objects.all().order_by("reader_id"):
        last_det = Detections.objects.filter(reader=r).order_by("-detected_at").first()
        is_online = last_det and last_det.detected_at >= online_cutoff
        status = "online" if is_online else "offline"

        total_tags = Detections.objects.filter(reader=r, detected_at__gte=stats_cutoff).count()

        if r.installation_date:
            days = (now.date() - r.installation_date).days
            uptime = "Less than 1 day" if days <= 0 else f"{days} days"
        else:
            uptime = "Unknown"

        antennas_payload = []
        for a in Antennas.objects.filter(reader=r).order_by("port_number"):
            count = Detections.objects.filter(
                reader=r,
                antenna=a,
                detected_at__gte=stats_cutoff
            ).count()

            antennas_payload.append({
                "number": a.port_number,
                "status": "active" if count > 0 else "inactive",
                "tagsDetected": count,
                "power": 30 if count > 0 else 0,
            })

        name = r.location or r.model or f"Reader-{r.reader_id}"

        readers_payload.append({
            "id": str(r.reader_id),
            "name": name,
            "model": r.model or "",
            "location": r.location or "",
            "status": status,
            "ipAddress": r.ip_address or "",
            "totalTagsDetected": total_tags,
            "uptime": uptime,
            "antennas": antennas_payload,
        })

    return JsonResponse({"readers": readers_payload})


# ----------------------------------------------------------------------
# AUTH API
# ----------------------------------------------------------------------

@csrf_exempt
def api_login(request):
    """POST {username, password} → login."""
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return JsonResponse({"detail": "Username and password required"}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"detail": "Invalid credentials"}, status=400)

    login(request, user)
    return JsonResponse({"detail": "ok", "user": _user_to_json(user)})


@csrf_exempt
def api_logout(request):
    """POST → logout."""
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    logout(request)
    return JsonResponse({"detail": "ok"})


def api_me(request):
    """GET → user session info."""
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False})

    return JsonResponse({"authenticated": True, "user": _user_to_json(request.user)})


# ----------------------------------------------------------------------
# USER LIST
# ----------------------------------------------------------------------

def api_users(request):
    """Return all Django users for the admin UI."""
    qs = User.objects.all().order_by("id")

    users = [{
        "id": u.id,
        "username": u.username,
        "first_name": u.first_name or "",
        "last_name": u.last_name or "",
        "email": u.email or "",
        "role": "admin" if (u.is_staff and u.is_superuser) else "staff",
        "status": "active" if u.is_active else "inactive",
        "created": u.date_joined.isoformat(),
        "last_active": u.last_login.isoformat() if u.last_login else None,
    } for u in qs]

    return JsonResponse({"users": users})


# ----------------------------------------------------------------------
# ACTIVITY LOGS (History of all detections)
# ----------------------------------------------------------------------

@csrf_exempt
def api_activity_logs(request):
    """Return all tag detections with optional date filtering."""
    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status=405)

    try:
        qs = (
            Detections.objects
            .select_related("reader", "antenna")
            .order_by("-detected_at")
        )

        # --- DATE FILTERS ---
        from_date = request.GET.get("from")
        to_date = request.GET.get("to")

        if from_date:
            qs = qs.filter(detected_at__date__gte=from_date)

        if to_date:
            qs = qs.filter(detected_at__date__lte=to_date)

        logs = []

        for d in qs:
            # find previous detection for this EPC, earlier than current
            previous = (
                Detections.objects
                .filter(epc=d.epc, detected_at__lt=d.detected_at)
                .order_by("-detected_at")
                .first()
            )

            if previous is None:
                event = "added"        # first time we ever saw this EPC
            elif (
                previous.reader_id != d.reader_id
                or previous.antenna_id != d.antenna_id
            ):
                event = "moved"        # same tag, different reader/antenna
            else:
                event = "detected"     # same place as last time

            logs.append({
                "id": d.detection_id,
                "timestamp": d.detected_at.isoformat(),
                "epc": d.epc,
                "objectName": getattr(
                    RfidItemsTemp.objects.filter(epc=d.epc).first(),
                    "item_name",
                    ""
                ),
                "reader": d.reader.model if d.reader else "",
                "antenna": d.antenna.port_number if d.antenna else None,
                "rssi": d.rssi,
                "event": event,   # 👈 now dynamic
            })

        return JsonResponse({"logs": logs})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
