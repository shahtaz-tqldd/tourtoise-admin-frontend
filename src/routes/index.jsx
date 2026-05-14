import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard";
import PrivateRoute from "./private-route";

import LoginPage from "@/pages/auth/login";

import OverviewPage from "@/pages/overview";
import UserPage from "@/pages/users";
import DestinationsPage from "@/pages/destinations";
import DestinationUpsertPage from "@/pages/destinations/upsert-destination";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <OverviewPage />,
      },
      {
        path: "/destinations",
        element: <DestinationsPage />,
      },
      {
        path: "/destinations/new-destination",
        element: <DestinationUpsertPage />,
      },
      {
        path: "/destinations/update/:destination_id",
        element: <DestinationUpsertPage />,
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
]);
