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
          url: `/admin/accounts/update-password/`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    updateAdminInfo: builder.mutation({
      query: (payload) => {
        return {
          url: `/admin/accounts/update-info/`,
          method: "PATCH",
          body: payload,
        };
      },
      invalidatesTags: ["my-profile"],
    }),

    userAccountList: builder.query({
      query: ({ page = 1, page_size = 10, search = "", status = "" }) => {
        const params = new URLSearchParams({ page, page_size });

        if (search) {
          params.set("search", search);
        }
        if (status) {
          params.set("status", status);
        }

        return {
          url: `/admin/accounts/list/?${params.toString()}`,
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
  useUpdateAdminInfoMutation,
} = authApiSlice;
