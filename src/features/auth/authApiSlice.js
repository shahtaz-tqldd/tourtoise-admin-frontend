import { apiSlice } from "../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => {
        return {
          url: `/admin/accounts/login/`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["my-profile"],
    }),

    selfDetails: builder.query({
      query: () => {
        return {
          url: `/admin/accounts/self-details`,
          method: "GET",
        };
      },
      providesTags: ["my-profile"],
    }),

    changePassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/admin/accounts/change-password`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    userAccountList: builder.query({
      query: ({ page, page_size, search_str }) => {
        return {
          url: `/admin/accounts/list/?page=${page}&page_size=${page_size}&search_str=${
            search_str || ""
          }`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSelfDetailsQuery,
  useChangePasswordMutation,
  useUserAccountListQuery,
} = authApiSlice;
