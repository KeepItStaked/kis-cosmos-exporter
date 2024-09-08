import fs from 'fs'
import YAML from 'yaml'
import axios from 'axios'
import Metric from '../metric.class.js'

import { getWalletBalance,getRewardsByAddress } from './functions.js'
import {
    wallet_balance_metric,
    wallet_rewards_metric,
} from '../prometheus/register.js'

const configFile = fs.readFileSync('./config.yaml', 'utf8')
const config = YAML.parse(configFile)

// get wallets address balance
class AddressBalanceMetric extends Metric {
    get() {
        config.addresses.forEach(async wallet => {
            try {
                const rawData = await getWalletBalance( config.exporter.api, { address: wallet.address, denom:config.chain.denom})
                const balance = parseInt(rawData / Math.pow(10, config.chain.exponent));

                wallet_balance_metric.labels(wallet.label, wallet.address, config.chain.denom).set(balance);
            } catch (err) {
                return console.log(`Error on AddressBalanceMetric! Msg: ${err}`)
            }
        })

    }
}
class WalletRewardsMetric extends Metric {
    get() {
        config.addresses.forEach(async wallet => {
            try {
                const rawData = await getRewardsByAddress( config.exporter.api, { address: wallet.address, denom:config.chain.denom})
                const balance = parseInt(rawData / Math.pow(10, config.chain.exponent));

                wallet_rewards_metric.labels(wallet.label, wallet.address, config.chain.denom ).set(balance);
            } catch (err) {
                return console.log(`Error on AddressBalanceMetric! Msg: ${err}`)
            }
        })

    }
}

export class AddressCollector {
    metrics = [
        new AddressBalanceMetric,
        new WalletRewardsMetric,

    ]
    collectAll() {
        return this.metrics.forEach(async metrics => await metrics.collect())
    }
}