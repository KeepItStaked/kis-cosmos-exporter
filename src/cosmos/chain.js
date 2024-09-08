import fs from 'fs'
import YAML from 'yaml'
import Metric from '../metric.class.js'
import axios from 'axios'

import {
    chain_min_signed_per_window_metric,
    chain_signed_block_window_metric,
    chain_latest_block_time_metric
} from '../prometheus/register.js'

const configFile = fs.readFileSync('./config.yaml', 'utf8')
const config = YAML.parse(configFile)

class ChainMinSignedPerWindowChainMetric extends Metric {
    async get() {
        try {
            const url = `${config.exporter.api}/cosmos/slashing/v1beta1/params`;
            const req = await axios(url);
            const min = parseFloat(req.data.params.min_signed_per_window)
            chain_min_signed_per_window_metric.set(min);
        } catch (err) {
            return console.log(`Error on ChainSignedBlockWindowMetric! Msg: ${err}`)
        }
    }
}

class ChainSignedBlockWindowChainMetric extends Metric {
    async get() {
        try {
            const url = `${config.exporter.api}/cosmos/slashing/v1beta1/params`;
            const req = await axios(url);
            const window = parseInt(req.data.params.signed_blocks_window)
            chain_signed_block_window_metric.set(window);
        } catch (err) {
            console.log(`Error on ChainSignedBlockWindowMetric! Msg: ${err}`)
            return true
        }
    }
}

class ChainLatestBlockTimeChainMetric extends Metric {
    async get() {
        try {
            const url = `${config.exporter.api}/cosmos/base/tendermint/v1beta1/blocks/latest`
            const req = await axios(url);
            const date = new Date(req.data.block.header.time).getTime();
            chain_latest_block_time_metric.set(date);
        } catch (err) {
            console.log(`Error on ChainLatestBlockTimeChainMetric! Msg: ${err}`)
            return true
        }
    }
}

export class ChainCollector {
    metrics = [
        new ChainMinSignedPerWindowChainMetric,
        new ChainSignedBlockWindowChainMetric,
        new ChainLatestBlockTimeChainMetric,
    ]
    collectAll() {
        return this.metrics.forEach(async metrics => await metrics.collect())
    }
}


