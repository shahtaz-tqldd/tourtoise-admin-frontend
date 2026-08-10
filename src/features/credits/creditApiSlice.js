import { apiSlice } from "../api/apiSlice";

export const creditApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    creditRequestList: builder.query({
      query: ({
        page = 1,
        page_size = 10,
        search_query = "",
        status = "",
      }) => {
        let url = `/admin/accounts/credit-requests/?page=${page}&page_size=${page_size}`;
        if (search_query) {
          url += `&search=${search_query}`;
        }
        if (status) {
          url += `&status=${status}`;
        }
        return {
          url,
          method: "GET",
        };
      },
    }),

    reviewCreditRequest: builder.mutation({
      query: ({ requestId, payload }) => {
        return {
          url: `/admin/accounts/credit-requests/${requestId}/review/`,
          method: "PATCH",
          body: payload,
        };
      },
    }),
  }),
});

export const { useCreditRequestListQuery, useReviewCreditRequestMutation } =
  creditApiSlice;
