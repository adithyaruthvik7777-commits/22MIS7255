
const required = [
  "EVAL_API_BASE_URL",
  "EVAL_EMAIL",
  "EVAL_NAME",
  "EVAL_MOBILE",
  "EVAL_GITHUB_USERNAME",
  "EVAL_ROLL_NO",
  "EVAL_ACCESS_CODE"
];

function buildConfig() {
  const missing = required.filter((k) => !process.env[k] || process.env[k].trim() === "");
  return {
    port: Number(process.env.PORT) || 3000,
    evalApiBaseUrl:
      process.env.EVAL_API_BASE_URL || "http://4.224.186.213/evaluation-service",
    credentials: {
      email: process.env.EVAL_EMAIL,
      name: process.env.EVAL_NAME,
      mobileNo: process.env.EVAL_MOBILE,
      githubUsername: process.env.EVAL_GITHUB_USERNAME,
      rollNo: process.env.EVAL_ROLL_NO,
      accessCode: process.env.EVAL_ACCESS_CODE
    },
    // Optional cached client identity from a prior /register call.
    clientId: process.env.EVAL_CLIENT_ID || null,
    clientSecret: process.env.EVAL_CLIENT_SECRET || null,

    missingRequired: missing
  };
}

module.exports = { buildConfig };