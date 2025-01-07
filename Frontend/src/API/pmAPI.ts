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

  ilpMiner: async (filename: string) => {
    return await axiosInstance.get(`/discover/ilp/${filename}`);
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

  filterActivities: async (
    filename: string,
    filter_set: string[],
    algo: string,
    filter: string
  ) => {
    switch (filter) {
      case "Start Activities":
        return await axiosInstance.post(
          `/filter/activities/start/${filename}`,
          {
            filter_set,
            algo,
          }
        );

      case "End Activities":
        return await axiosInstance.post(`/filter/activities/end/${filename}`, {
          filter_set,
          algo,
        });

      case "Attributes":
        return await axiosInstance.post(`/filter/attributes/${filename}`, {
          filter_set,
          algo,
        });
      default:
        throw { msg: "Undefined filter" };
    }
  },

  topProcesses: async (filename: string, n: number) => {
    return await axiosInstance.get(`/discover/stats/${filename}`, {
      params: { n },
    });
  },

  conformanceChecking: async (filename: string, log: File) => {
    const formData = new FormData();
    formData.append("log", log);

    return await axiosInstance.post(
      `/conformance_checking/${filename}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  bpmn: async (filename: string) => {
    return await axiosInstance.get(`/discover/bpmn/${filename}`);
  },

  getSummary: async (filename: string) => {
    return await axiosInstance.get(`/summary/${filename}`);
  },
};
export default PMapi;
