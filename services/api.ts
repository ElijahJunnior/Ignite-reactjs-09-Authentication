import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from 'nookies';

const { 'nextauth.token': token } = parseCookies();
let isRefreshing = false; console.log(':::: isRefresing = false ::::');
let failedRequestQueue = [];

export const api = axios.create({
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

        const { 'nextauth.refreshToken': refreshTokenOLD } = parseCookies();

        api.post('/refresh', {
          refreshTokenOLD,
        }).then(response => {

          const { token, refreshToken } = response.data;

          console.log('::: POST -> /refresh :::');

          setCookie(undefined, 'nextauth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 Dias
            path: '/'
          });

          setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 Dias
            path: '/'
          });

          api.defaults.headers['Authorization'] = `Bearer ${token}`;

          failedRequestQueue.forEach(request => request.onSuccess(token));

          failedRequestQueue = [];

        }).catch((err) => {

          failedRequestQueue.forEach(request => request.onFailure(err));

          failedRequestQueue = [];

        }).finally(() => {

          isRefreshing = false;

        });

      }

      return new Promise((resolve, reject) => {
        failedRequestQueue.push({
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
      // desloga da aplicação
    }

  }

})
