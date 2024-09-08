import * as Prometheus from 'prom-client'
import fs from 'fs'
import YAML from 'yaml'

const configFile = fs.readFileSync('./config.yaml', 'utf8')
const config = YAML.parse(configFile)

export const client = Prometheus

const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
export const register = new Prometheus.Registry();

register.setDefaultLabels({
    network: config.chain.network,
    chain_id: config.chain.chain_id
})

// chain section
export const chain_min_signed_per_window_metric = new client.Gauge({
    name: "chain_min_signed_per_window",
    help: "amount of block validator must sign within window to avoid slashing",
})
register.registerMetric(chain_min_signed_per_window_metric)

export const chain_signed_block_window_metric = new client.Gauge({
    name: "chain_signed_block_window",
    help: "chain signed block window from slashing parameters",
})
register.registerMetric(chain_signed_block_window_metric)

export const chain_latest_block_time_metric = new client.Gauge({
    name: "chain_latest_block_time",
    help: "shows last chain block time on api node. Usefull to be sure you have latest data",
})
register.registerMetric(chain_latest_block_time_metric)


// validator section
export const validator_is_active_metric = new client.Gauge({
    name: "validator_is_active",
    help: "Shows current validator status bonded/unbonded",
    labelNames: ['moniker', 'valoper']
})
register.registerMetric(validator_is_active_metric)

export const validator_is_jailed_metric = new client.Gauge({
    name: "validator_is_jailed",
    help: "Shows current validator status bonded/unbonded",
    labelNames: ['moniker', 'valoper']
})
register.registerMetric(validator_is_jailed_metric)

export const validator_bond_metric = new client.Gauge({
    name: "validator_bond",
    help: "shows validator total staked value",
    labelNames: ['moniker', 'valoper', 'denom']
})
register.registerMetric(validator_bond_metric)

export const validator_missed_blocks_metric = new client.Gauge({
    name: "validator_missed_blocks",
    help: "shows validator total missed blocks within the slash window",
    labelNames: ['moniker', 'valcons']
})
register.registerMetric(validator_missed_blocks_metric)

export const validator_commission_rate_metric = new client.Gauge({
    name: "validator_commission_rate",
    help: "shows validator commission rate",
    labelNames: ['moniker', 'valoper']
})
register.registerMetric(validator_commission_rate_metric)

export const validator_commission_metric = new client.Gauge({
    name: "validator_commission",
    help: "shows validator commission available to withdraw",
    labelNames: ['moniker', 'valoper', 'denom']
})
register.registerMetric(validator_commission_metric)

export const validator_rank_metric = new client.Gauge({
    name: "validator_rank",
    help: "shows validator placement in validators list",
    labelNames: ['moniker', 'valoper']
})
register.registerMetric(validator_rank_metric)

// address section
export const wallet_balance_metric = new client.Gauge({
    name: "wallet_balance",
    help: "shows balance of a given address",
    labelNames: ['label', 'address', 'denom']
})
register.registerMetric(wallet_balance_metric)

export const wallet_rewards_metric = new client.Gauge({
    name: "wallet_rewards",
    help: "shows rewards of a given address",
    labelNames: ['label', 'address', 'denom']
})
register.registerMetric(wallet_rewards_metric)

