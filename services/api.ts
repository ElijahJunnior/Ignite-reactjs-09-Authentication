import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from 'nookies';
import { signOut } from "../contexts/AuthContext";

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupApiClient(ctx = undefined) {

  const { 'nextauth.token': token } = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  api.interceptors.response.use(response => {

    return response

  }, (error: AxiosError) => {

    if (error.response.status === 401) {

      if (error.response.data?.code === 'token.expired') {

        const originalConfig = error.config;

        if (!isRefreshing) {

          isRefreshing = true;

          const { 'nextauth.refreshToken': refreshTokenOLD } = parseCookies(ctx);

          api.post('/refresh', {
            refreshToken: refreshTokenOLD,
          }).then(response => {

            const token = response?.data?.token
            const refreshToken = response?.data?.refreshToken

            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 Dias
              path: '/'
            });

            setCookie(ctx, 'nextauth.refreshToken', refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 Dias
              path: '/'
            });

            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            failedRequestsQueue.forEach(request => request.onSuccess(token));

            failedRequestsQueue = [];

          }).catch((err) => {

            failedRequestsQueue.forEach(request => request.onFailure(err));

            failedRequestsQueue = [];

            if (process.browser) {
              signOut()
            }

          }).finally(() => {

            isRefreshing = false;

          });

        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`;
              resolve(api(originalConfig));
            },
            onFailure: (error: AxiosError) => {
              reject(error);
            }
          })
        });

      } else {
        if (process.browser) {
          signOut()
        }
      }

    }

    // Caso o erro não tenha sido tratado pela função passa ele pra frente
    return Promise.reject(error);

  })

  return api

}
