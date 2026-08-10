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

    aiUsage: builder.query({
      query: ({ startDate, endDate }) => {
        return {
          url: `/admin/analytics/ai-usage`,
          method: "GET",
          params: {
            ...(startDate ? { start_date: startDate } : {}),
            ...(endDate ? { end_date: endDate } : {}),
          },
        };
      },
    }),
  }),
});

export const { useUserGrowthQuery, useOverviewQuery, useAiUsageQuery } =
  analyticsApiSlice;
