# SecureShield AI 🛡️
### Intelligent Cybersecurity Threat Detection & Document Remediation System

SecureShield AI is a state-of-the-art cybersecurity platform combining machine learning classification, heuristic risk engines, and active document sanitization to detect, classify, and neutralize payload threats. 

---

## 🚀 Key Features

* **Multi-Threat Scanner**: Select or drag-and-drop multiple file payloads concurrently (PDF, ZIP, EXE, DOCX). Includes a laser sweep slide animation in the UI when scans or remediations are active.
* **Metadata Sanitization**: Neutralizes files by purging malicious embedded JavaScript scripts, OLE objects, suspicious hyperlinks, and sensitive metadata.
* **Security Health Card**: A dedicated analytics page featuring a radial SVG score gauge, scanning metrics grids, and dynamic, context-aware precaution recommendations.
* **Cyber Dashboard**: Visual control panel integrating Line and Doughnut charts reporting threat distributions, protected file counters, and system alerts.
* **ML Risk Engine**: Seamlessly integrates Scikit-Learn models (Random Forest, Decision Tree classifiers) to evaluate binary hashes, signatures, and risk factors.
* **2FA & OTP Auth**: Enhanced user account protection using JWT-based logins, session management, and verification codes printed to the developer console log.
* **Modern Cyberpunk Aesthetics**: A sleek responsive layout styled with dark modes, Orbitron/Inter fonts, glowing neon borders, and an animated particle network nodes background canvas.

---

## 🛠️ Technology Stack

* **Backend**: Python 3.x, Django, Django REST Framework (DRF), SimpleJWT, Scikit-Learn.
* **Frontend**: React.js, Vite, Tailwind CSS, Chart.js, HTML5 Canvas API.
* **Database**: SQLite (default `db.sqlite3` development database).

---

## 📂 Project Structure

```text
secureshield-AI/
├── backend/                   # Django Backend Service
│   ├── adminpanel/            # Administrative stats dashboard integrations
│   ├── alerts/                # Security notification signals & alert triggers
│   ├── authentication/        # User signup, login, 2FA credentials, and OTP emails
│   ├── dashboard/             # Core telemetry & User Security Health Card heuristics
│   ├── history/               # Scanning database query history endpoints
│   ├── ml_engine/             # Scikit-learn loaders & classifier prediction controls
│   ├── ml_models/             # Pickle models (.pkl) for ML classifications
│   ├── news/                  # Cybersecurity RSS news feed parsers
│   ├── scanner/               # Multi-file uploads & Content Disarm/Reconstruction (CDR)
│   ├── secureshield_core/     # Global Django settings, WSGI, and URL patterns
│   └── users/                 # Custom User authentication profiles and schema
├── frontend/                  # React Frontend Service
│   ├── src/
│   │   ├── components/        # Helper UI modules
│   │   │   ├── PrivateRoute.jsx   # Route guard shielding authenticated pages
│   │   │   ├── Skeleton.jsx       # Cyber-themed page loading wireframes
│   │   │   └── TechBackground.jsx # Dynamic canvas rendering animated nodes
│   │   ├── contexts/          # State providers
│   │   │   └── AuthContext.jsx    # Session auth & token refresh states
│   │   ├── layouts/           # Structure page layouts
│   │   │   ├── Footer.jsx         # Bottom footer trademark information
│   │   │   ├── MainLayout.jsx     # Side navbar & page container mesh wrapper
│   │   │   ├── Navbar.jsx         # Top session settings and profile action bar
│   │   │   └── Sidebar.jsx        # Sidebar navigation containing all routes
│   │   ├── pages/             # Frontend view components
│   │   │   ├── Admin.jsx          # Security analyst stats, files and metrics
│   │   │   ├── Alerts.jsx         # Intrusion log alerts page
│   │   │   ├── Dashboard.jsx      # Telemetry control and graph dashboards
│   │   │   ├── HealthCard.jsx     # Dedicated security health card profile
│   │   │   ├── History.jsx        # Comprehensive file upload scan audits
│   │   │   ├── Home.jsx           # Welcome landing page
│   │   │   ├── Login.jsx          # Standard authentication login portal
│   │   │   ├── News.jsx           # Cyber Threat updates and feeds
│   │   │   ├── OTPVerification.jsx# Verification flow for registering users
│   │   │   ├── Profile.jsx        # Account settings, logs, and sessions
│   │   │   ├── Scanner.jsx        # Multi-file upload, analysis, and CDR clean
│   │   │   ├── Signup.jsx         # User registration portal
│   │   │   └── VerifyLoginOTP.jsx # 2FA OTP verification code portal
│   │   ├── services/          # Services APIs
│   │   │   └── api.js             # Central Axios client interceptor
│   │   ├── tests/             # React testing scripts
│   │   │   ├── Auth.test.jsx      # Test cases for AuthContext wrappers
│   │   │   ├── Component.test.jsx # Test cases for Skeletons & pages
│   │   │   └── setupTests.js      # Testing library mock config script
│   │   ├── App.jsx            # Core routing and navigation pathways
│   │   ├── index.css          # Orbitron typography, neon glows, laser animations
│   │   └── main.jsx           # Client root mounting file
├── media/                     # Upload storage directories
│   ├── scanned_files/         # Original user uploads
│   └── cleaned_files/         # Remediated safe documents
└── README.md                  # System Documentation
```

---

## 💻 Setup & Installation

### 1. Prerequisites
Ensure you have the following installed locally:
* Python (v3.10+)
* Node.js (v18+)

---

### 2. Backend Installation (Django)

1. Open your terminal, navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a python virtual environment:
   ```bash
   # On Windows
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. Install required backend packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Launch the backend server:
   ```bash
   python manage.py runserver
   ```
   *The server will run on `http://127.0.0.1:8000/`.*

---

### 3. Frontend Installation (React)

1. Open a new terminal tab and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   *The client will launch on `http://localhost:5173/`.*

---

## 🧪 Running Unit Tests

Verify system integrity by running backend integration tests:
```bash
cd backend
.venv\Scripts\activate
python manage.py test
```
*(Runs 25 integration tests covering authorization, scanner, metadata sanitization views, and security score health heuristics).*
