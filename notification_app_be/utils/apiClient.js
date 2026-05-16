const axios = require("axios");
const { Log } = require("logging-middleware");
const { buildConfig } = require("../config");
const { getToken } = require("../auth/tokenManager");

const cfg = buildConfig();

const client = axios.create({
  baseURL: cfg.evalApiBaseUrl,
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${token}`;
  await Log("backend", "info", "utils", `HTTP ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

client.interceptors.response.use(
  async (response) => {
    await Log(
      "backend",
      "info",
      "utils",
      `HTTP ${response.config.method?.toUpperCase()} ${response.config.url} -> ${response.status}`
    );
    return response;
  },
  async (error) => {
    const cfgErr = error.config || {};
    const status = error.response?.status ?? "ERR";
    await Log(
      "backend",
      "error",
      "utils",
      `HTTP ${cfgErr.method?.toUpperCase()} ${cfgErr.url} failed [${status}]: ${error.message}`
    );
    return Promise.reject(error);
  }
);

module.exports = { client };