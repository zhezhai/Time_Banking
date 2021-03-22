import Axios from "axios";

const axiosNode = Axios.create({
  baseURL: "http://localhost:3001",
});

const axiosFlask = Axios.create({
  baseURL: "http://localhost:80",
});

axiosNode.defaults.withCredentials = true;

export { axiosNode, axiosFlask };
