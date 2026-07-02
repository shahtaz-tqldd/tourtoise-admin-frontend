import { apiSlice } from "../api/apiSlice";

export const journalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    journalList: builder.query({
      query: ({ page = 1, page_size = 10, search_query = "" }) => {
        let url = `/admin/journals/list?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        return {
          url,
          method: "GET",
        };
      },
    }),

    journalDetails: builder.query({
      query: (journal_id) => {
        return {
          url: `/admin/journals/${journal_id}/details/`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useJournalListQuery, useJournalDetailsQuery } = journalApiSlice;
