import express from "express";
import indexRouter from "./routes/index.js";
import { initEnv, assetsRoot } from "./lib/env-loader.js";
import authRouter from "./routes/auth.js";

initEnv();

const app = express();
const port = 8080; // default port to listen

// Configure Express to use EJS
// all paths relative to folders in ./dist
app.set("views", "./src/views");
app.set("view engine", "ejs");
// Configure the public folder
// app.use(process.env.ASSETS_PATH || "", express.static("./dist/public"));
app.use(assetsRoot() || "", express.static("./src/public"));
// set middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

app.use("/", indexRouter);
app.use("/auth", authRouter);

// start the express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
