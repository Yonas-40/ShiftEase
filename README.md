# ShiftEase – Employee Shift Management System

ShiftEase is a **home care employee shift management system** designed to help managers efficiently assign and track employee work shifts.

## 🚀 Features

- Assign employees to shifts (Day Shift: 07:00-15:00, Evening Shift: 15:00-22:00)
- Manage employee roles (Employee, Manager, Admin)
- View and calculate **monthly working hours**
- Secure authentication & role-based access
- Manager Dashboard for shift planning
- Employee profile management

## 🛠 Technologies Used

- **Backend**: Django + PostgreSQL
- **Frontend**: React + Vite
- **Authentication**: Django Authentication
> **Deployment**: Docker, Nginx, Gunicorn

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Yonas-40/ShiftEase.git
cd ShiftEase
```

### 2. Backend Setup (Django + PostgreSQL)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # (or .venv\Scripts\activate for Windows)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```

## 👥 User Roles & Access

| Role    | Access  |
|---------|--------|
| **Admin**   | Full access, Add Manager,manage everything |
| **Manager** | Assign shifts, Add, Update and Delete Employees, view reports |
| **Employee** | View assigned shifts, update profile |

## 🤝 Contributing

Want to contribute? Fork the repo, make changes, and submit a Pull Request!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

