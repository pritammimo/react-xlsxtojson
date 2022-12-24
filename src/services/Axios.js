import axios from "axios";
export const baseURL = "https://node-api-32md.onrender.com";
let axiosInstance = axios.create({
    baseURL,
  });
  axiosInstance.interceptors.request.use(
    function (config) {
      return config;
    },
    function (err) {
      return Promise.reject(err);
    }
  );
  export default axiosInstance;