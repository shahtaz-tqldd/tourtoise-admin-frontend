import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/typography";
import { Plus } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const DestinationsPage = () => {
  return (
    <section>
      <div className="flbx">
        <Title variant="lg">Destinations</Title>
        <Link to="/destinations/new-destination">
          <Button>
            <div className="flx gap-2">
              <Plus size={16} />
              New Destination
            </div>
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default DestinationsPage;
