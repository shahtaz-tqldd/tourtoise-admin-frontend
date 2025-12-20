import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./layouts/dashboard";
import Overview from "./pages/overview";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/reset-password";
import DestinationsPage from "./pages/destinations";
import AddDestinationPage from "./pages/add-destinations";
import UserPage from "./pages/users";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        path: "/",
        element: <Overview />,
      },
      {
        path: "/destinations",
        element: <DestinationsPage />,
      },
      {
        path: "/destinations/new-destination",
        element: <AddDestinationPage />,
      },
      {
        path: "/users",
        element: <UserPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/sign-up",
    element: <RegisterPage />,
  },
  {
    path: "/forget-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);
