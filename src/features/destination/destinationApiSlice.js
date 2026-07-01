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
  }),
});

export const {
  // destinations
  useCreateNewDestinationMutation,
  useDestinationListQuery,
  useDestinationDetailQuery,
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
} = destinationApiSlice;
