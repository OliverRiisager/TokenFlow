const express = require("express");
const {createSession} = require("better-sse");

var traceProcessor = require("./tools/traceProcessor");

const config = require("./config");

const cors = require("cors");
const app = express();
const { PORT = 3000 } = process.env;

const traceProcessorInstance = new traceProcessor(config);
let cachedTxHash = undefined;

app.use(cors());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("./public"));

app.get("/sse", async (req, res) => {
	let messageToSet = traceProcessorInstance.currentProcessMessage;
	traceProcessorInstance.attachCallback((e) => session === undefined ? messageToSet = e: session.push(e, "progressChanged"));
	const session = await createSession(req, res);
	res.sse = session;
	if(messageToSet != undefined){
		res.sse.push(messageToSet);
		messageToSet = undefined;
	}
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
