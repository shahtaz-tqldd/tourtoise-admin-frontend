import { Text, Title } from "@/components/ui/typography";
import { useDestinationShortDetailsQuery } from "@/features/destination/destinationApiSlice";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link, NavLink } from "react-router-dom";

const destinationTabs = [
  { label: "Attractions", to: "attractions" },
  { label: "Activities", to: "activities" },
  { label: "Cuisines", to: "cuisines" },
];

const DestinationContentHeader = ({ destinationId, title, action }) => {
  const { data, isFetching } = useDestinationShortDetailsQuery(destinationId);
  const destination = data?.data || data;
  const destinationName = destination?.name;

  return (
    <div className="space-y-4">
      <div className="flbx flex-wrap gap-4">
        <div className="flx gap-3">
          <Link to="/destinations" className="inline-flex items-center gap-2">
            <ArrowLeft />
          </Link>
          <div>
            <Title variant="lg">
              {destinationName ? `${title} of ${destinationName}` : title}
            </Title>
            {isFetching && (
              <Text variant="xs" className="mt-1">
                Loading destination...
              </Text>
            )}
          </div>
        </div>
        {action}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {destinationTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={`/destinations/${destinationId}/${tab.to}`}
            className={({ isActive }) =>
              cn(
                "inline-flex h-10 items-center border-b-2 border-transparent px-2 pb-2 text-sm font-medium text-slate-600 transition-colors hover:text-primary",
                isActive && "border-primary text-primary",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default DestinationContentHeader;
