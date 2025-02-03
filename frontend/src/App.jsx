import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/Home.jsx';
import MonthlyWorkingHoursTable from './components/MonthlyWorkingHoursTable.jsx';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'; // Import ThemeProvider and createTheme
import ManagerDashboard from "./components/ManagerDashboard.jsx";
import DashboardLayoutLanding from "./components/DashboardLayoutLanding.jsx";
import Calendar from './components/Calendar.jsx';
import SignIn from "./components/SignIn.jsx";
import Employees from "./components/Employees.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import EmployeeDashboard from "./components/EmployeeDashboard.jsx";
import EmployeeProfilePage from "./components/EmployeeProfilePage.jsx";
import ManagerProfilePage from "./components/ManagerProfilePage.jsx";

// Create a theme (you can customize this as needed)
const theme = createTheme({
  // Add custom theme settings here if necessary
});

function App() {
  return (
    <ThemeProvider theme={theme}> {/* Wrap the entire app with ThemeProvider */}
      <CssBaseline />

      {/* Define routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
        <Route path="/employee-dashboard/*" element={<EmployeeDashboard />}>
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:username" element={<EmployeeProfilePage />} />
          <Route path="profile/:username" element={<ManagerProfilePage />} />
          <Route path="monthlyworkinghourstable" element={<MonthlyWorkingHoursTable />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>

        <Route path="/" element={<DashboardLayoutLanding />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
        </Route>
        <Route path="/*" element={<ManagerDashboard />}>
          <Route path="employees" element={<Employees />} />
          <Route path="monthlyworkinghourstable" element={<MonthlyWorkingHoursTable />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
