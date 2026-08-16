import { getAuthCookie, removeAuthCookie } from "./useCookie";

export const getTokens = () => {
  const { accessToken: cookieAccessToken, refreshToken: cookieRefreshToken } =
    getAuthCookie();

  const sessionAccessToken = sessionStorage.getItem("tourtoise_admin_access");
  const sessionRefreshToken = sessionStorage.getItem("tourtoise_admin_refresh");

  if (cookieRefreshToken) {
    return {
      accessToken: cookieAccessToken,
      refreshToken: cookieRefreshToken,
      rememberMe: true,
    };
  } else {
    return {
      accessToken: sessionAccessToken,
      refreshToken: sessionRefreshToken,
      rememberMe: false,
    };
  }
};

export const clearTokens = () => {
  sessionStorage.removeItem("tourtoise_admin_access");
  sessionStorage.removeItem("tourtoise_admin_refresh");
  removeAuthCookie();
};

export const setSessionToken = (accessToken, refreshToken) => {
  sessionStorage.setItem("tourtoise_admin_access", accessToken);
  sessionStorage.setItem("tourtoise_admin_refresh", refreshToken);
};
