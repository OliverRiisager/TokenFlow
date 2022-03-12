import Express from 'express';
import {createSession} from 'better-sse';

import {httpGethProvider} from './config';
import {ConfigService} from './src/services/configService';
import {TraceProcessor} from './src/traceProcessor';

// @ts-ignore
import cors from 'cors';
const app = Express();
const {PORT = 3000} = process.env;

ConfigService.getInstance().setConfigFromUrl(httpGethProvider);
const traceProcessorInstance = new TraceProcessor();
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
