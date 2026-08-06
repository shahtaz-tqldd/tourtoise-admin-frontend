import { apiSlice } from "../api/apiSlice";

export const tripApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    tripList: builder.query({
      query: ({
        page = 1,
        page_size = 10,
        search_query = "",
        country = "",
      }) => {
        const params = new URLSearchParams({ page, page_size });

        if (search_query) {
          params.set("search", search_query);
        }
        if (country) {
          params.set("country", country);
        }

        return {
          url: `/admin/trips/list?${params.toString()}`,
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
