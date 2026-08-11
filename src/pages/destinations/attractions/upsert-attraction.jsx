import React from "react";
import { useParams } from "react-router-dom";

import ChildUpsertForm from "../components/child-upsert-form";
import { attractionUpsertConfig } from "../components/child-upsert-config";
import {
  useAttractionDetailQuery,
  useCreateAttractionMutation,
  useUpdateAttractionMutation,
} from "@/features/destination/destinationApiSlice";

const UpsertAttractionPage = () => {
  const { destination_id, attraction_id } = useParams();
  const isUpdateMode = Boolean(attraction_id);
  const { data, isFetching } = useAttractionDetailQuery(
    { destination_id, attraction_id },
    { skip: !isUpdateMode },
  );
  const [createAttraction, { isLoading: isCreateLoading }] =
    useCreateAttractionMutation();
  const [updateAttraction, { isLoading: isUpdateLoading }] =
    useUpdateAttractionMutation();

  return (
    <ChildUpsertForm
      config={attractionUpsertConfig}
      destinationId={destination_id}
      resourceId={attraction_id}
      detailData={data}
      isDetailFetching={isFetching}
      createResource={(formData) =>
        createAttraction({ destination_id, formData })
      }
      updateResource={(formData) =>
        updateAttraction({ destination_id, attraction_id, formData })
      }
      isCreateLoading={isCreateLoading}
      isUpdateLoading={isUpdateLoading}
    />
  );
};

export default UpsertAttractionPage;
