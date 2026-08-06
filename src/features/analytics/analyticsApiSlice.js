import { apiSlice } from "../api/apiSlice";

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    overview: builder.query({
      query: () => {
        let url = `/admin/analytics/overview`;
        return {
          url,
          method: "GET",
        };
      },
    }),

    userGrowth: builder.query({
      query: ({ month }) => {
        return {
          url: `/admin/analytics/user-growth`,
          method: "GET",
          params: month ? { month } : undefined,
        };
      },
    }),
  }),
});

export const { useUserGrowthQuery, useOverviewQuery } = analyticsApiSlice;
