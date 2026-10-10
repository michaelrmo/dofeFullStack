import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose"; 
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js"; 
import userRoutes from "./routes/users.js";
import stripeRoutes from "./routes/stripe.js";



/* CONFIGS*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.set("trust proxy", "loopback");
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(helmet.crossOriginResourcePolicy({ policy:"cross-origin" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(bodyParser.json({ limit: "30mb", extended: true}));
app.use(cors());
app.disable('x-powered-by')

const app1 = express();
app1.set("trust proxy", "loopback");
app1.use(helmet());
app1.use(cors());
app1.use(morgan("common"));
app1.use(helmet.crossOriginResourcePolicy({ policy:"cross-origin" }));
app1.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app1.disable('x-powered-by')


app.use("/assets",express.static(path.join(__dirname, "public/assets")));

/* Routes */
const healthcheck = (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
};
app.get("/healthz", healthcheck);
app1.get("/healthz", healthcheck);
app.use("/auth", authRoutes); // Use the authRoutes router for /auth routes
app.use("/users", userRoutes);

app1.use("/stripe", stripeRoutes)

/* MONGOOSE SETUP*/
/*This uses an api url and port which are located in a seperate hidden .env file*/
const PORT = Number(process.env.PORT || 3001);
const S_PORT = Number(process.env.S_PORT || 4242);
const HOST = process.env.HOST || "0.0.0.0";
mongoose.connect(process.env.MONGO_URL, {
}).then(() => {
    app.listen(PORT, HOST, () => console.log(`Server running on port: ${PORT}`));
}).catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
});

//Stripe endpoint

app1.listen(S_PORT, HOST, () => console.log(`Stripe running on port: ${S_PORT}`));

