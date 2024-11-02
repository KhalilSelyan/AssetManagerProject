import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { appRouter } from "./trpc/index.js";
import { createContext } from "./trpc/context.js";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyCsrfProtection from "@fastify/csrf-protection";
const server = fastify();

// Helper function to parse and validate origins
const parseAllowedOrigins = (originsString: string | undefined): string[] => {
  if (!originsString) {
    // Default fallback origins for development
    if (process.env.NODE_ENV === "development") {
      return ["http://localhost:3000", "http://localhost:5173"];
    }
    return ["https://assetmanager.khalilselyan.com"];
  }

  const origins = originsString
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins;
};

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

server.register(fastifyCors, {
  origin: (origin, cb) => {
    // Allow if origin is in our allowed list or if it's not defined (non-browser requests)
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.length === 0
    ) {
      cb(null, true);
    } else {
      console.log(
        `Origin '${origin}' rejected - not in allowed list:`,
        allowedOrigins
      );
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
});

server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET ?? "your-secret",
  parseOptions: {
    sameSite: "none",
    secure: true,
    domain: "khalilselyan.com",
  },
});
server.register(fastifyCsrfProtection);

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

server.route({
  method: "GET",
  url: "/api/csrf_token",
  handler: async (req, reply) => {
    const token = reply.generateCsrf();
    return { token };
  },
});

server.listen(
  { port: Number(process.env.PORT) || 3001, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  }
);
