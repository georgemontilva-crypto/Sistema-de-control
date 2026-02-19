import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./drizzle/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: "mysql://root:nRLcqivoBqFoHAyWSMFhYZjJTBfiAHvl@shuttle.proxy.rlwy.net:14120/railway",
  },
});
