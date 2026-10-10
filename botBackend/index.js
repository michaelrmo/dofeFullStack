// Importing the needed dependencies
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import botRoutes from "./routes/botRoutes.js"

dotenv.config();

// Some stuff for the app to use

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(helmet.crossOriginResourcePolicy({ policy:"cross-origin" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(bodyParser.json({ limit: "30mb", extended: true}));
app.use(cors());
//Something that apparently makes the app more secure (doesnt show that its an apache or NGinX server)
app.disable('x-powered-by')

//Creating an endpoit

app.get("/healthz", (req, res) => res.json({ status: "ok" }));
app.use("/regBots", botRoutes)
const PORT = Number(process.env.PORT || 3002);
const HOST = process.env.HOST || "0.0.0.0";

// Listening on the the given port
app.listen(PORT, HOST, () => console.log(`Bot backend listening on http://${HOST}:${PORT}`));
