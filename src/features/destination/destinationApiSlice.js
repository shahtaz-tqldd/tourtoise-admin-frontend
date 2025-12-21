import { apiSlice } from "../api/apiSlice";

export const destinationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createNewDestination: builder.mutation({
      query: (formData) => {
        return {
          url: `/destinations/create`,
          method: "POST",
          body: formData,
        };
      },
    }),

    uploadDestinationImages: builder.mutation({
      query: (formData) => {
        return {
          url: `/destinations/upload-images`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    destinationList: builder.query({
      query: ({ page = 1, page_size = 10, search_query = "" }) => {
        let url = `/destinations/list?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        return {
          url,
          method: "GET",
        };
      },
    }),

    deleteDestination: builder.mutation({
      query: (destination_id) => {
        return {
          url: `/destinations/${destination_id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    // accommodation type
    accomodationTypeList: builder.query({
      query: () => {
        return {
          url: "/destinations/accommodation-type/list",
          method: "GET",
        };
      },
      providesTags: ["accommodation-type"],
    }),

    createAccomodationType: builder.mutation({
      query: (payload) => {
        return {
          url: "/destinations/accommodation-type/create",
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["accommodation-type"],
    }),

    // transport type
    transportTypeList: builder.query({
      query: () => {
        return {
          url: "/destinations/transport-type/list",
          method: "GET",
        };
      },
      providesTags: ["transport-type"],
    }),

    createTransportType: builder.mutation({
      query: (payload) => {
        return {
          url: "/destinations/transport-type/create",
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["transport-type"],
    }),

    // activity type
    activityTypeList: builder.query({
      query: () => {
        return {
          url: "/destinations/activity-type/list",
          method: "GET",
        };
      },
      providesTags: ["activity-type"],
    }),

    createActivityType: builder.mutation({
      query: (payload) => {
        return {
          url: "/destinations/activity-type/create",
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ["activity-type"],
    }),
  }),
});

export const {
  useCreateNewDestinationMutation,
  useUploadDestinationImagesMutation,
  useDestinationListQuery,
  useDeleteDestinationMutation,

  // additional
  useAccomodationTypeListQuery,
  useCreateAccomodationTypeMutation,
  useTransportTypeListQuery,
  useCreateTransportTypeMutation,
  useActivityTypeListQuery,
  useCreateActivityTypeMutation,
} = destinationApiSlice;
