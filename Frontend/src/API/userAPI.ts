import axios from "axios";
import Cookies from "js-cookie";
const API_BASE_URL = "http://localhost:8000/user";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

const api = {
  login: async (email: string, password: string) => {
    return await axiosInstance.post("/login", { email, password });
  },

  signup: async (email: string, password: string) => {
    return await axiosInstance.post("/signup", { email, password });
  },

  getUser: async (userId: number) => {
    const accessToken = Cookies.get("access_token");
    return await axiosInstance.get(`/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  requesResetPasswordLink: async (email: string) => {
    return await axiosInstance.post("/request-password-reset", {
      email,
    });
  },

  checkResetPasswordToken: async (token: string) => {
    return await axiosInstance.post("/check-reset-token", { token });
  },

  resetPassword: async (new_password: string, token: string) => {
    return await axiosInstance.post("/reset-password", {
      new_password,
      token,
    });
  },
};

export default api;
