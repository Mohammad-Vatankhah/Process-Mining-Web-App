import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8000/pm";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

const PMapi = {
  upload: async (file: File) => {
    const accessToken = Cookies.get("access_token");

    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return await axiosInstance.post("/upload", formData, {
      headers,
    });
  },

  alphaMiner: async (filename: string) => {
    return await axiosInstance.get(`/discover/alpha_miner/${filename}`);
  },

  heuristicMiner: async (filename: string) => {
    return await axiosInstance.get(`/discover/heuristic_miner/${filename}`);
  },

  inductiveMiner: async (filename: string) => {
    return await axiosInstance.get(`/discover/inductive_miner/${filename}`);
  },

  dfg: async (filename: string) => {
    return await axiosInstance.get(`/discover/dfg/${filename}`);
  },

  socialNetwork: async (filename: string) => {
    return await axiosInstance.get(`/social_network/${filename}`);
  },

  footprint: async (filename: string) => {
    return await axiosInstance.get(`/discover/footprint/${filename}`);
  },

  getAllActivities: async (filename: string) => {
    return await axiosInstance.get(`/activities/all/${filename}`);
  },

  getStartActivity: async (filename: string) => {
    return await axiosInstance.get(`/activities/start/${filename}`);
  },

  getEndActivity: async (filename: string) => {
    return await axiosInstance.get(`/activities/end/${filename}`);
  },

  filterStartActivities: async (filename: string, filter_set: string[]) => {
    return await axiosInstance.post(`/filter/activities/start/${filename}`, {
      filter_set,
    });
  },

  filterEndActivities: async (filename: string, filter_set: string[]) => {
    return await axiosInstance.post(`/filter/activities/end/${filename}`, {
      filter_set,
    });
  },

  filterActivities: async (filename: string, filter_set: string[]) => {
    return await axiosInstance.post(`/filter/attributes/${filename}`, {
      filter_set,
    });
  },
};
export default PMapi;
