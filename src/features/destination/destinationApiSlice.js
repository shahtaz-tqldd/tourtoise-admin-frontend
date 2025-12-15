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
  }),
});

export const { useCreateNewDestinationMutation, useDestinationListQuery } =
  destinationApiSlice;
