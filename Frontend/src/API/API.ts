import axios from "axios";
import Cookies from "js-cookie";
const API_BASE_URL = "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

const api = {
  login: async (email: string, password: string) => {
    return await axiosInstance.post("/user/login", { email, password });
  },

  signup: async (email: string, password: string) => {
    return await axiosInstance.post("/user/signup", { email, password });
  },

  getUser: async (userId: number) => {
    const accessToken = Cookies.get("access_token");
    return await axiosInstance.get(`/user/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  requesResetPasswordLink: async (email: string) => {
    return await axiosInstance.post("/user/request-password-reset", {
      email,
    });
  },

  checkResetPasswordToken: async (token: string) => {
    return await axiosInstance.post("/user/check-reset-token", { token });
  },

  resetPassword: async (new_password: string, token: string) => {
    return await axiosInstance.post("/user/reset-password", {
      new_password,
      token,
    });
  },
};

export default api;
