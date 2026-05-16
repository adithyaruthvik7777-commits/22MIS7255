/**
 * Token manager.
 *
 * Responsibilities:
 *   1. Register with the evaluation server (only if no cached client identity).
 *   2. Authenticate to obtain a Bearer access_token.
 *   3. Cache the token in memory and refresh it ~30s before expiry.
 *   4. Serialize concurrent refresh attempts with an in-flight Promise so a
 *      burst of API calls doesn't trigger N parallel /auth requests.
 *
 * Returns the raw `access_token` string from getToken().
 */

const axios = require("axios");
const { Log } = require("logging-middleware");
const { buildConfig } = require("../config");

const REFRESH_LEEWAY_MS = 30 * 1000;

const cfg = buildConfig();
let clientId = cfg.clientId;
let clientSecret = cfg.clientSecret;

let tokenCache = null; // { accessToken, expiresAt }
let inFlight = null;   // Promise<string> guarding concurrent refresh

async function register() {
  if (clientId && clientSecret) return { clientID: clientId, clientSecret };

  const url = `${cfg.evalApiBaseUrl}/register`;
  await Log("backend", "info", "auth", `Registering with evaluation server at ${url}`);

  const body = {
    email: cfg.credentials.email,
    name: cfg.credentials.name,
    mobileNo: cfg.credentials.mobileNo,
    githubUsername: cfg.credentials.githubUsername,
    rollNo: cfg.credentials.rollNo,
    accessCode: cfg.credentials.accessCode
  };

  try {
    const { data } = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });
    if (!data || !data.clientID || !data.clientSecret) {
      throw new Error("register response missing clientID/clientSecret");
    }
    clientId = data.clientID;
    clientSecret = data.clientSecret;
    await Log("backend", "info", "auth", "Registration successful; clientID/Secret cached in memory");
    return { clientID: clientId, clientSecret };
  } catch (err) {
    await Log("backend", "error", "auth", `Registration failed: ${err.message}`);
    throw err;
  }
}

async function authenticate() {
  const { clientID, clientSecret: cs } = await register();
  const url = `${cfg.evalApiBaseUrl}/auth`;
  await Log("backend", "info", "auth", `Authenticating at ${url}`);

  const body = {
    email: cfg.credentials.email,
    name: cfg.credentials.name,
    rollNo: cfg.credentials.rollNo,
    accessCode: cfg.credentials.accessCode,
    clientID,
    clientSecret: cs
  };

  try {
    const { data } = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });
    if (!data || !data.access_token) {
      throw new Error("auth response missing access_token");
    }
    const expiresInMs = (Number(data.expires_in) || 3600) * 1000;
    tokenCache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + expiresInMs
    };
    // Make the token available to the logging middleware too, so /logs gets the
    // same bearer once we have one.
    process.env.LOG_API_TOKEN = data.access_token;

    await Log(
      "backend",
      "info",
      "auth",
      `Authentication successful; token valid for ${Math.round(expiresInMs / 1000)}s`
    );
    return tokenCache.accessToken;
  } catch (err) {
    await Log("backend", "error", "auth", `Authentication failed: ${err.message}`);
    throw err;
  }
}

function tokenIsFresh() {
  return (
    tokenCache &&
    tokenCache.accessToken &&
    tokenCache.expiresAt - Date.now() > REFRESH_LEEWAY_MS
  );
}

async function getToken() {
  if (tokenIsFresh()) return tokenCache.accessToken;

  if (!inFlight) {
    inFlight = authenticate().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

function _resetForTests() {
  tokenCache = null;
  inFlight = null;
}

module.exports = { getToken, _resetForTests };