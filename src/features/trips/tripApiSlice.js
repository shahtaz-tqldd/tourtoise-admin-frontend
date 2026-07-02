import { apiSlice } from "../api/apiSlice";

export const tripApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    tripList: builder.query({
      query: ({ page = 1, page_size = 10, search_query = "" }) => {
        let url = `/admin/trips/list?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        return {
          url,
          method: "GET",
        };
      },
    }),

    tripDetails: builder.query({
      query: (trip_id) => {
        return {
          url: `/admin/trips/${trip_id}/details/`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useTripListQuery, useTripDetailsQuery } = tripApiSlice;
