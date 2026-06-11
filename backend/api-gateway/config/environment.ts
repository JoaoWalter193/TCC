export const env = {
  port: parseInt(process.env.GATEWAY_PORT || "3000", 10),

  bi: {
    baseUrl: process.env.BI_MS_URL || "http://localhost:8085",
    prefix: "/api/bi",
  },

  business: {
    baseUrl: process.env.BUSINESS_MS_URL || "http://localhost:8080",
    prefix: "/api/v1",
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || "http://localhost:4200,http://localhost:8100").split(","),
  },
};
