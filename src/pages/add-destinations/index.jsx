import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/typography";
import { Download } from "lucide-react";
import React from "react";

const AddDestinationPage = () => {
  return (
    <section>
      <div className="flbx">
        <Title variant="lg">Add New Destinations</Title>

        <Button variant="outline">
          <div className="flx gap-2">
            <Download size={16} />
            Import
          </div>
        </Button>
      </div>
    </section>
  );
};

export default AddDestinationPage;
