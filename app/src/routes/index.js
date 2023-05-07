import express from "express";
import { assetsRoot } from "../lib/env-loader.js";
const indexRouter = express.Router();

// middleware that is specific to this router
indexRouter.use((req, res, next) => {
	// console.log("Time: ", Date.now());
	next();
});

// define the home page route
indexRouter.get("/", (req, res) => {
	res.render("public/index/page", {
		pageTitle: "Aarya (beta)",
		stylesHref: `${assetsRoot()}/styles/output.css`,
	});
});

export default indexRouter;
