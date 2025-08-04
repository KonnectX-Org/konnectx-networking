import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import v1Routes from "./routes/v1/index";
import errorHandlerMiddleware from "./middlewares/errorHandler";
import notFoundMiddleware from "./middlewares/notFound";
import cookieParser from "cookie-parser";
import logger from "./utils/logger";
// socket imports
import { Server } from "socket.io";
import http from "http";
import { initializeSocket } from "./modules/reqWall/sockets/socketHandler";



dotenv.config();
connectDB();

const app = express();
// Changes for attaching sockets
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? ["https://event.creativeupaay.com"]
      : ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// Initialize Socket.IO handlers
initializeSocket(io);







const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false, // Disable default CSP if it's causing issues
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' * data: blob:; connect-src 'self' https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; img-src 'self' data: *;"
  );
  next();
});

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://event.creativeupaay.com"]
      : ["http://localhost:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// app.use(cors());

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", v1Routes);

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(buildPath, "index.html"));
  });
}

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const args = process.argv.slice(2);
const portArgIndex = args.indexOf("--port");
const PORT =
  portArgIndex !== -1
    ? Number(args[portArgIndex + 1])
    : Number(process.env.PORT) || 3333;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export io for use in controllers
export { io };