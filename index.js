import express from "express"
import fs from 'fs'
import YAML from 'yaml'
import { register, client } from './src/prometheus/register.js'
import { ChainCollector } from './src/cosmos/chain.js'
import { ValidatorCollector } from './src/cosmos/validator.js'
import { AddressCollector } from './src/cosmos/address.js'

const configFile = fs.readFileSync('./config.yaml', 'utf8')
const config = YAML.parse(configFile)

const app = express();

const DataCollector = (() => {
    const metrics = [
        new ChainCollector,
        new ValidatorCollector,
        new AddressCollector
    ]

    return {
        collectAll: () => metrics.forEach(metric => metric.collectAll())
    }
})()

app.get("/metrics", async function (req, res) {
    DataCollector.collectAll()
    res.setHeader("Content-Type", register.contentType);
    register.metrics().then((data) => res.status(200).send(data));
});

app.listen(config.exporter.port, () => {
    console.log(`========Exporter started on port: ${config.exporter.port}========`);
});