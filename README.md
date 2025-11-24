
# RoboAI RFID Tracking System

This system consists of:

- **Backend:** Django REST API for RFID data processing, authentication, and database integration  
- **Frontend:** React + Vite UI (RFID-UI)  
- **Database:** MariaDB / MySQL  
- **RFID Reader:** Sends tag reads to Django endpoint `/rfid/connect/`

This document explains how to install, configure, and run the entire setup.

---

# 📌 1. Prerequisites

### Backend
- Python 3.10+
- pip
- virtualenv (optional)

### Frontend
- Node.js 18+
- npm or yarn

### Database
- MariaDB or MySQL installed
- `mycli` for easy database access

Install `mycli` (optional but recommended):

```bash
sudo apt install mycli
````

---

# 📦 2. Database Setup (MariaDB/MySQL)

### 2.1 Log into MySQL using mycli:

```bash
sudo mycli -u root -p
```

### 2.2 Create database & user

```sql
CREATE DATABASE rfid_db CHARACTER SET utf8mb4;

CREATE USER 'rfid_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';

GRANT ALL PRIVILEGES ON rfid_db.* TO 'rfid_user'@'localhost';

FLUSH PRIVILEGES;
```

### 2.3 Verify connection:

```bash
mycli -u rfid_user -p rfid_db
```

---

# ⚙️ 3. Backend Setup (Django)

Navigate to your Django backend folder (where `manage.py` exists):

```bash
cd rfid_project_folder
```

### 3.1 Create virtual environment (recommended)

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3.2 Install dependencies

```bash
pip install -r requirements.txt
```

### 3.3 Run migrations (if needed)

```bash
python manage.py migrate
```

### 3.4 Start Django backend server

Run on all interfaces so RFID Reader & frontend can reach it:

```bash
python manage.py runserver 0.0.0.0:8000
```

### 3.5 Django admin panel

Open in browser:

```
http://<server-ip>:8000/admin/
```

---

# 🎨 4. Frontend Setup (React + Vite)

Navigate to the RFID-UI folder:

```bash
cd RFID-UI
```

### 4.1 Install dependencies

```bash
npm install
```

### 4.2 Start development server

```bash
npm run dev -- --host
```

You will see something like:

```
Local:   http://localhost:5173/
Network: http://10.80.26.210:5173/
```

Open in browser.

---

# 🔌 5. System Connectivity Overview

| Component              | Runs On   | Description                                       |
| ---------------------- | --------- | ------------------------------------------------- |
| **Frontend (React)**   | :5173     | User interface for dashboard, search, logs, users |
| **Backend (Django)**   | :8000     | Processes RFID reads and provides API             |
| **Database (MariaDB)** | local     | Stores all tracking, inventory, and user data     |
| **RFID Reader**        | HTTP POST | Sends data to `/rfid/connect/`                    |

**Frontend calls backend** using:

```
http://<server-ip>:8000/api/...
```

**Backend stores reads** into MySQL tables:

* `readers`
* `antennas`
* `detections`
* `rfid_items_temp`
* Django `auth_user`
* etc.

---

# 📡 6. RFID Reader Integration

Set your Impinj Speedway Connect to POST to:

```
http://<server-ip>:8000/rfid/connect/
```

Django receives the data → parses → saves → frontend fetches live updates.

---

# 🧪 7. Testing the System

### Check backend:

```
curl http://localhost:8000/api/auth/me/
```

### Check frontend:

Open:

```
http://localhost:5173/
```

Log in with your Django admin credentials.

---

# 🔧 8. Troubleshooting

### Can’t log in to Django admin?

Use:

```bash
python manage.py createsuperuser
```

### Session cookie issues?

Make sure these settings are correct in `settings.py`:

```py
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
```

### Frontend cannot reach backend?

Check CORS:

```py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
```

---

# 🎉 System Ready!

You now have:

* **Backend running** → `http://0.0.0.0:8000`
* **Frontend running** → `http://localhost:5173`
* **Database connected** → `rfid_db`
* **RFID Reader integrated**
* **Login system working (Django auth)**

Enjoy your complete RFID tracking platform 🚀

