import React from "react";
import { useParams } from "react-router-dom";

import ChildUpsertForm from "../components/child-upsert-form";
import { cuisineUpsertConfig } from "../components/child-upsert-config";
import {
  useCreateCuisineMutation,
  useCuisineDetailQuery,
  useUpdateCuisineMutation,
} from "@/features/destination/destinationApiSlice";

const UpsertCuisinePage = () => {
  const { destination_id, cuisine_id } = useParams();
  const isUpdateMode = Boolean(cuisine_id);
  const { data, isFetching } = useCuisineDetailQuery(
    { destination_id, cuisine_id },
    { skip: !isUpdateMode },
  );
  const [createCuisine, { isLoading: isCreateLoading }] =
    useCreateCuisineMutation();
  const [updateCuisine, { isLoading: isUpdateLoading }] =
    useUpdateCuisineMutation();

  return (
    <ChildUpsertForm
      config={cuisineUpsertConfig}
      destinationId={destination_id}
      resourceId={cuisine_id}
      detailData={data}
      isDetailFetching={isFetching}
      createResource={(formData) => createCuisine({ destination_id, formData })}
      updateResource={(formData) =>
        updateCuisine({ destination_id, cuisine_id, formData })
      }
      isCreateLoading={isCreateLoading}
      isUpdateLoading={isUpdateLoading}
    />
  );
};

export default UpsertCuisinePage;
