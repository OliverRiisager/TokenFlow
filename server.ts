import Express from "express";
import { createSession } from "better-sse";

import {config} from './config';
import {configService} from './src/configService';
import {traceProcessor} from "./src/traceProcessor";

import cors from "cors";
const app = Express();
const { PORT = 3000 } = process.env;

configService.getInstance().setConfig(new config());
const traceProcessorInstance = new traceProcessor();
let cachedTxHash = undefined;

app.use(cors());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(Express.static("./public"));

app.get("/sse", async (req, res:any) => {
	const session = await createSession(req, res);
	res.sse = session;
	res.sse.push(cachedTxHash ? cachedTxHash : "", "txHash");
});
app.get("/", (req, res) => {
	res.render("index");
});

app.get("/tx/:txhash", (req, res) => {
	res.render("index");
});

app.get("/transfers/:txhash", (req, res) => {
	let txhash = req.params.txhash;
	cachedTxHash = txhash;
	traceProcessorInstance
		.getTransfers(txhash)
		.then(transfers => {
			res.status(200).send(transfers);
		})
		.catch((err) => {
			let pokkers = {desc: "There was an error :(", err: err}
			res.status(200).send(pokkers);
		});
});

app.listen(PORT, () => {
	console.log(`server started at ${PORT}`);
});
