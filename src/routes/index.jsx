import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard";
import PrivateRoute from "./private-route";

import LoginPage from "@/pages/auth/login";

import OverviewPage from "@/pages/overview";
import UserPage from "@/pages/users";
import DestinationsPage from "@/pages/destinations";
import DestinationUpsertPage from "@/pages/destinations/upsert-destination";
import DestinationDetailPage from "@/pages/destinations/destination-detail";
import AttractionListPage from "@/pages/destinations/attractions";
import UpsertAttractionPage from "@/pages/destinations/attractions/upsert-attraction";
import ActivityListPage from "@/pages/destinations/activities";
import CuisineListPage from "@/pages/destinations/cuisines";
import TripListPage from "@/pages/trips";
import JournalListPage from "@/pages/journals";
import AccountSettingsPage from "@/pages/auth/account-settings";

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
        path: "/destinations/:destination_id",
        element: <DestinationDetailPage />,
      },
      {
        path: "/destinations/:destination_id/attractions",
        element: <AttractionListPage />,
      },
      {
        path: "/destinations/:destination_id/activities",
        element: <ActivityListPage />,
      },
      {
        path: "/destinations/:destination_id/cuisines",
        element: <CuisineListPage />,
      },
      {
        path: "/destinations/:destination_id/attractions/new-attraction",
        element: <UpsertAttractionPage />,
      },
      {
        path: "/destinations/:destination_id/attractions/update/:attraction_id",
        element: <UpsertAttractionPage />,
      },
      {
        path: "/trips",
        element: <TripListPage />,
      },
      {
        path: "/travel-journals",
        element: <JournalListPage />,
      },
      {
        path: "/users",
        element: <UserPage />,
      },
      {
        path: "/settings",
        element: <AccountSettingsPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
