import { apiSlice } from "../api/apiSlice";

export const destinationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createNewDestination: builder.mutation({
      query: (data) => {
        return {
          url: `/destinations/create`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["destination-list"],
    }),

    destinationList: builder.query({
      query: ({ page = 1, page_size = 10, search_query }) => {
        let url = `/destinations?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }

        return {
          url,
          method: "GET",
        };
      },
    }),

    accomodationTypeList: builder.query({
      query: () => {
        return {
          url: "/destinations/accommodation-type/list",
          method: "GET",
        };
      },
    }),

    transportTypeList: builder.query({
      query: () => {
        return {
          url: "/destinations/transport-type/list",
          method: "GET",
        };
      },
    }),

    activityTypeList: builder.query({
      query: () => {
        return {
          url: "/destinations/activity-type/list",
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useCreateNewDestinationMutation,
  useDestinationListQuery,
  useAccomodationTypeListQuery,
  useTransportTypeListQuery,
  useActivityTypeListQuery,
} = destinationApiSlice;
