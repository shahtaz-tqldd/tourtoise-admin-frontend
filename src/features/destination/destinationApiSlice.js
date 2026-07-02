import { apiSlice } from "../api/apiSlice";

export const destinationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // destinations
    createNewDestination: builder.mutation({
      query: (formData) => {
        return {
          url: `/admin/destinations/create/`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    destinationList: builder.query({
      query: ({ page = 1, page_size = 10, search_query = "" }) => {
        let url = `/admin/destinations/list?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["destination-list"],
    }),

    destinationDetail: builder.query({
      query: (destination_id) => {
        return {
          url: `/admin/destinations/${destination_id}/detail/`,
          method: "GET",
        };
      },
    }),

    destinationShortDetails: builder.query({
      query: (destination_id) => {
        return {
          url: `/admin/destinations/${destination_id}/short-details/`,
          method: "GET",
        };
      },
    }),

    updateDestination: builder.mutation({
      query: ({ destination_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/update/`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    deleteDestination: builder.mutation({
      query: (destination_id) => {
        return {
          url: `/admin/destinations/${destination_id}/delete/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    downloadTemplate: builder.query({
      query: () => {
        return {
          url: `/admin/destinations/bulk-template/`,
          method: "GET",
        };
      },
    }),

    bulkUpload: builder.mutation({
      query: (payload) => {
        return {
          url: `/admin/destinations/bulk-upload/`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    scrapDestination: builder.mutation({
      query: (payload) => {
        return {
          url: `/admin/destinations/run-spider/`,
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    // attractions
    attractionList: builder.query({
      query: ({
        destination_id,
        page = 1,
        page_size = 10,
        search_query = "",
      }) => {
        let url = `/admin/destinations/${destination_id}/attractions/?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["attraction-list"],
    }),

    createAttraction: builder.mutation({
      query: ({ destination_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/attractions/`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["attraction-list"],
    }),

    attractionDetail: builder.query({
      query: ({ destination_id, attraction_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/attractions/${attraction_id}/`,
          method: "GET",
        };
      },
      providesTags: ["attraction-list"],
    }),

    updateAttraction: builder.mutation({
      query: ({ destination_id, attraction_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/attractions/${attraction_id}/`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["attraction-list"],
    }),

    deleteAttraction: builder.mutation({
      query: ({ destination_id, attraction_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/attractions/${attraction_id}/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["attraction-list"],
    }),

    downloadAttractionTemplate: builder.query({
      query: ({ destination_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/attractions/bulk-template/`,
          method: "GET",
        };
      },
    }),

    bulkAttractionUpload: builder.mutation({
      query: ({ destination_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/attractions/bulk-upload/`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["attraction-list"],
    }),

    // activities
    activityList: builder.query({
      query: ({
        destination_id,
        page = 1,
        page_size = 10,
        search_query = "",
      }) => {
        let url = `/admin/destinations/${destination_id}/activities/?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["activity-list"],
    }),

    createActivity: builder.mutation({
      query: ({ destination_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/activities/`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["activity-list"],
    }),

    activityDetail: builder.query({
      query: ({ destination_id, activity_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/activities/${activity_id}/`,
          method: "GET",
        };
      },
      providesTags: ["activity-list"],
    }),

    updateActivity: builder.mutation({
      query: ({ destination_id, activity_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/activities/${activity_id}/`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["activity-list"],
    }),

    deleteActivity: builder.mutation({
      query: ({ destination_id, activity_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/activities/${activity_id}/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["activity-list"],
    }),

    downloadActivityTemplate: builder.query({
      query: ({ destination_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/activities/bulk-template/`,
          method: "GET",
        };
      },
    }),

    bulkActivityUpload: builder.mutation({
      query: ({ destination_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/activities/bulk-upload/`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["activity-list"],
    }),

    // cuisines
    cuisineList: builder.query({
      query: ({
        destination_id,
        page = 1,
        page_size = 10,
        search_query = "",
      }) => {
        let url = `/admin/destinations/${destination_id}/cuisines/?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["cuisine-list"],
    }),

    createCuisine: builder.mutation({
      query: ({ destination_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/cuisines/`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["cuisine-list"],
    }),

    cuisineDetail: builder.query({
      query: ({ destination_id, cuisine_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/cuisines/${cuisine_id}/`,
          method: "GET",
        };
      },
      providesTags: ["cuisine-list"],
    }),

    updateCuisine: builder.mutation({
      query: ({ destination_id, cuisine_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/cuisines/${cuisine_id}/`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["cuisine-list"],
    }),

    deleteCuisine: builder.mutation({
      query: ({ destination_id, cuisine_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/cuisines/${cuisine_id}/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["cuisine-list"],
    }),

    downloadCuisineTemplate: builder.query({
      query: ({ destination_id }) => {
        return {
          url: `/admin/destinations/${destination_id}/cuisines/bulk-template/`,
          method: "GET",
        };
      },
    }),

    bulkCuisineUpload: builder.mutation({
      query: ({ destination_id, formData }) => {
        return {
          url: `/admin/destinations/${destination_id}/cuisines/bulk-upload/`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["cuisine-list"],
    }),
  }),
});

export const {
  // destinations
  useCreateNewDestinationMutation,
  useDestinationListQuery,
  useDestinationDetailQuery,
  useDestinationShortDetailsQuery,
  useUpdateDestinationMutation,
  useDeleteDestinationMutation,
  useDownloadTemplateQuery,
  useBulkUploadMutation,
  useScrapDestinationMutation,

  // attractions
  useAttractionListQuery,
  useCreateAttractionMutation,
  useAttractionDetailQuery,
  useUpdateAttractionMutation,
  useDeleteAttractionMutation,
  useDownloadAttractionTemplateQuery,
  useBulkAttractionUploadMutation,

  // activities
  useActivityListQuery,
  useCreateActivityMutation,
  useActivityDetailQuery,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useDownloadActivityTemplateQuery,
  useBulkActivityUploadMutation,

  // cuisines
  useCuisineListQuery,
  useCreateCuisineMutation,
  useCuisineDetailQuery,
  useUpdateCuisineMutation,
  useDeleteCuisineMutation,
  useDownloadCuisineTemplateQuery,
  useBulkCuisineUploadMutation,
} = destinationApiSlice;
