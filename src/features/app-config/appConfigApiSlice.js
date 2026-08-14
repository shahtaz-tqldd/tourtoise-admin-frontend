import { apiSlice } from "../api/apiSlice";

export const appConfigApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    appConfig: builder.query({
      query: ({
        branding,
        legal_document,
        feature,
        announcement,
        platform_default,
        seo,
        audit,
        document_type,
      } = {}) => {
        const params = new URLSearchParams();

        if (branding !== undefined) params.append("branding", branding);
        if (legal_document !== undefined)
          params.append("legal_document", legal_document);
        if (feature !== undefined) params.append("feature", feature);
        if (announcement !== undefined)
          params.append("announcement", announcement);
        if (platform_default !== undefined)
          params.append("platform_default", platform_default);
        if (seo !== undefined) params.append("seo", seo);
        if (audit !== undefined) params.append("audit", audit);
        if (document_type) params.append("document_type", document_type);

        const queryString = params.toString();

        return {
          url: `/config/${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["app-config"],
    }),

    updateAppConfig: builder.mutation({
      query: ({ payload }) => ({
        url: `/admin/config/update/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["app-config"],
    }),
  }),
});

export const { useAppConfigQuery, useUpdateAppConfigMutation } =
  appConfigApiSlice;
