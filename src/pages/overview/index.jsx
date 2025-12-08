import React from "react";
import { Text, Title } from "@/components/ui/typography";

const Overview = () => {
  return (
    <div className="space-y-12">
      {/* Page Title */}
      <div>
        <Title variant="lg">Overview</Title>
        <Text className="mt-2">
          High-level summary of store performance, customer activity, and
          important metrics.
        </Text>
      </div>

      {/* Stats section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-100 rounded-lg p-6">
            <Title variant="sm">Total Revenue</Title>
            <Text variant="sm" className="mt-2">
              Display total revenue generated over selected period.
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-6">
            <Title variant="sm">Orders</Title>
            <Text variant="sm" className="mt-2">
              Total number of orders and order distribution summary.
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-6">
            <Title variant="sm">Customers</Title>
            <Text variant="sm" className="mt-2">
              Total active customers and new sign-ups.
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg p-6">
            <Title variant="sm">Products</Title>
            <Text variant="sm" className="mt-2">
              Inventory count, active products, and stock warnings.
            </Text>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-x-6 gap-y-12">
        {/* Sales Section Placeholder */}
        <section>
          <Title>Sales Overview</Title>
          <Text className="mt-2">Overall sales performance on this month</Text>

          <div className="bg-gray-100 rounded-lg p-6 h-[380px] center mt-6">
            <Text>Sales chart or performance module placeholder</Text>
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <Title>Recent Orders</Title>
          <Text className="mt-2">Most recent customer orders</Text>

          <div className="bg-gray-100 rounded-lg p-6 h-[380px] center mt-6">
            <Text>Recent orders table placeholder</Text>
          </div>
        </section>

        {/* Top Products */}
        <section>
          <Title>Top Selling Products</Title>
          <Text className="mt-2">
            Your best performing products with sales numbers rankings.
          </Text>

          <div className="bg-gray-100 rounded-lg p-6 h-[380px] center mt-6">
            <Text>Top products list placeholder</Text>
          </div>
        </section>

        {/* Store Notices */}
        <section>
          <Title>Important Alerts</Title>
          <Text className="mt-2">
            System alerts, low stock notifications, or pending tasks
          </Text>

          <div className="bg-gray-100 h-[380px] center rounded-lg p-6 mt-6">
            <Text>Alerts / notifications placeholder</Text>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Overview;
