# Shiftease

A full-stack web application designed to simplify employee scheduling and shift management for businesses. Managers can create, edit, and publish schedules, while employees can view their upcoming shifts, request time off, and swap shifts with coworkers.

![Shiftease App Screenshot](/assets/screenshot-calendar-view.png) <!-- See Step 3 -->

## 🚀 Live Demo

Experience the application live:
*   **Frontend (Main Application):** [https://shiftease.se](https://shiftease.se)
*   **Backend (API):** [https://api.shiftease.se](https://api.shiftease.se)

## 📁 Source Code

This is a full-stack project comprised of two separate codebases:
*   **Frontend Repository:** [github.com/Yonas-40/shiftease-frontend](https://github.com/Yonas-40/shiftease-frontend-latest)
*   **Backend Repository:** [github.com/Yonas-40/shiftease-backend](https://github.com/Yonas-40/shiftease-backend-latest)

## ✨ Features

### For Managers:
*   **Intuitive Schedule Creation:** Few clicks for assigning shifts.
*   **Availability Approval:** View and approve/deny employee availabilities.
*   **Time-off Approval:** View and approve/deny employee time-off requests.
*   **Shift Swap Oversight:** Approve or deny shift swaps between employees.

### For Employees:
*   **Personalized Dashboard:** View your schedule for the current and upcoming weeks.
*   **Shift Swap Requests:** Request to swap a shift with another eligible employee.
*   **Time-off Requests:** Submit requests for time off directly through the app.
*   **Availability Setting:** Set your availabilities to be approved/denied by manager.

## 🛠️ Tech Stack

This project uses a modern, decoupled architecture:

**Frontend:**
*   **Framework:** [React.js / Vite]
*   **Styling:** [Tailwind CSS]
*   **Socket:**  [Websocket]
*   **HTTP Client:** [Axios / Fetch API]
*   **Deployment:** [Netlify]

**Backend:**
*   **Runtime:** [Django]
*   **Framework:** [Django]
*   **Database:** [PostgreSQL]
*   **Authentication:** [JWT]
*   **API Documentation:** [REST]
*   **Deployment:** [Render]

## 🗄️ Database Schema

<!-- This is a PRO move. It shows you understand data modeling. -->
![Database Schema Diagram](/path/to/your/database-schema.png) <!-- Optional but impressive -->


## 🚦 Getting Started (Local Development)

To run this project locally, you need to clone and set up both the frontend and backend repositories.

### Prerequisites
*   Node.js (v18 or higher)
*   npm, yarn, or pnpm
*   Django
*   PostgreSQL (or your chosen database)

### Backend Setup
1.  Clone the backend repo:
    ```bash
    git clone https://github.com/Yonas-40/shiftease-backend.git
    cd shiftease-backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Environment Variables: Create a `.env` file based on `.env.example` and populate your database URL and JWT secret.
4.  Database Setup: Run migrations:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```
5.  Start the development server:
    ```bash
    python manage.py runserver
    ```
    The API server will typically start on `http://localhost:3001` (or your configured port).

### Frontend Setup
1.  Clone the frontend repo:
    ```bash
    git clone https://github.com/Yonas-40/shiftease-frontend.git
    cd shiftease-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Environment Variables: Create a `.env` file and add your backend API URL (e.g., `VITE_API_URL=http://localhost:3001`).
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will typically start on `http://localhost:5173`.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 👤 Author

Yonas Zeratsion
- [[Portfolio](https://yonas-portfolio-six.vercel.app/)]
- [[LinkedIn Profile](https://www.linkedin.com/in/yonas-asmerom-92b54622b/)]
- [yonasasmerom40@gmail.com]
