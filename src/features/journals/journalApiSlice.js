import { apiSlice } from "../api/apiSlice";

export const journalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    journalReportList: builder.query({
      query: ({ page = 1, page_size = 10, target = "", status = "" }) => {
        let url = `/admin/journals/reports?page=${page}&page_size=${page_size}`;
        if (target) {
          url += `&target_type=${target}`;
        }
        if (status) {
          url += `&status=${status}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["report-list"],
    }),

    journalReportReview: builder.mutation({
      query: ({ reportId, payload }) => {
        return {
          url: `/admin/journals/reports/${reportId}/review/`,
          method: "PATCH",
          body: payload,
        };
      },
      invalidatesTags: ["report-list"],
    }),
  }),
});

export const { useJournalReportListQuery, useJournalReportReviewMutation } =
  journalApiSlice;
