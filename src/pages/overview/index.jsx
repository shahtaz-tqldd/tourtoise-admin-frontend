import React from "react";
import { Text, Title } from "@/components/ui/typography";
import OverviewStats from "./components/stats";
import UserGrowth from "./components/user-growth";

const Overview = () => {
  return (
    <div>
      {/* Page Title */}
      <div>
        <Title variant="lg">Overview</Title>
        <Text className="mt-2">
          High-level summary of user growth, user activity, and important
          metrics.
        </Text>
      </div>
      <div className="space-y-5 mt-10">
        <OverviewStats />
        <UserGrowth />
      </div>
    </div>
  );
};

export default Overview;
