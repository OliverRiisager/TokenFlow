import Express from 'express';
// @ts-ignore
import {createSession} from 'better-sse';
import {TraceProcessor, Web3Provider} from './src';
import { httpGethProvider } from './config';
// @ts-ignore
import cors from 'cors';
import Web3 from 'web3';
const app = Express();
const {PORT = 3000} = process.env;
const traceProcessorInstance = new TraceProcessor(new Web3Provider(new Web3(new Web3.providers.HttpProvider(httpGethProvider))));
let cachedTxHash: string | undefined = undefined;

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(Express.static('./public'));

app.get('/sse', async (req, res: any) => {
    const session = await createSession(req, res);
    res.sse = session;
    res.sse.push(cachedTxHash ? cachedTxHash : '', 'txHash');
});
// @ts-ignore
app.get('/', (req, res) => {
    res.render('index');
});

// @ts-ignore
app.get('/tx/:txhash', (req, res) => {
    res.render('index');
});

app.get('/transfers/:txhash', (req, res) => {
    let txhash = req.params.txhash;
    cachedTxHash = txhash;
    traceProcessorInstance
        .getTransfers(txhash)
        .then((transfers) => {
            res.status(200).send(transfers);
        })
        .catch((err) => {
            let pokkers = {desc: 'There was an error :(', err: err};
            res.status(200).send(pokkers);
        });
});

app.listen(PORT, () => {
    console.log(`server started at ${PORT}`);
});
