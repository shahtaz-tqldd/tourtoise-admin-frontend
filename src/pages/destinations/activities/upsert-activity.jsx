import React from "react";
import { useParams } from "react-router-dom";

import ChildUpsertForm from "../components/child-upsert-form";
import { activityUpsertConfig } from "../components/child-upsert-config";
import {
  useActivityDetailQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
} from "@/features/destination/destinationApiSlice";

const UpsertActivityPage = () => {
  const { destination_id, activity_id } = useParams();
  const isUpdateMode = Boolean(activity_id);
  const { data, isFetching } = useActivityDetailQuery(
    { destination_id, activity_id },
    { skip: !isUpdateMode },
  );
  const [createActivity, { isLoading: isCreateLoading }] =
    useCreateActivityMutation();
  const [updateActivity, { isLoading: isUpdateLoading }] =
    useUpdateActivityMutation();

  return (
    <ChildUpsertForm
      config={activityUpsertConfig}
      destinationId={destination_id}
      resourceId={activity_id}
      detailData={data}
      isDetailFetching={isFetching}
      createResource={(formData) =>
        createActivity({ destination_id, formData })
      }
      updateResource={(formData) =>
        updateActivity({ destination_id, activity_id, formData })
      }
      isCreateLoading={isCreateLoading}
      isUpdateLoading={isUpdateLoading}
    />
  );
};

export default UpsertActivityPage;
