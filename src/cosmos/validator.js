import fs from 'fs'
import YAML from 'yaml'
import axios from 'axios'
import Metric from '../metric.class.js'

import {
    validator_bond_metric,
    validator_missed_blocks_metric,
    validator_commission_rate_metric,
    validator_is_active_metric,
    validator_is_jailed_metric,
    validator_commission_metric,
    validator_rank_metric
} from '../prometheus/register.js'

const configFile = fs.readFileSync('./config.yaml', 'utf8')
const config = YAML.parse(configFile)

class ValidatorIsActiveValidatorMetric extends Metric {
    get() {
        config.validators.forEach(async validator => {

            try {
                const url = `${config.exporter.api}/cosmos/staking/v1beta1/validators/${validator.valoper}`;
                const req = await axios(url);
                const status = req.data.validator.status == "BOND_STATUS_BONDED" ? 1 : 0;
                validator_is_active_metric.labels(validator.moniker, validator.valoper).set(status)
            } catch (err) {
                console.log(`Error on ValidatorIsActiveValidatorMetric! Msg: ${err}`)
            }
        })
    }
}

class ValidatorIsJailedValidatorMetric extends Metric {
    get() {
        config.validators.forEach(async validator => {

            try {
                const url = `${config.exporter.api}/cosmos/staking/v1beta1/validators/${validator.valoper}`;
                const req = await axios(url);
                const status = req.data.validator.jailed == false ? 0 : 1;
                validator_is_jailed_metric.labels(validator.moniker, validator.valoper).set(status)
            } catch (err) {
                console.log(`Error on ValidatorIsActiveValidatorMetric! Msg: ${err}`)
            }
        })
    }
}

class ValidatorBondValidatorMetric extends Metric {
    get() {
        config.validators.forEach(async validator => {

            try {
                const url = `${config.exporter.api}/cosmos/staking/v1beta1/validators/${validator.valoper}`;
                const req = await axios(url);
                const bond = parseInt(req.data.validator.tokens / Math.pow(10, config.chain.exponent));
                validator_bond_metric.labels(validator.moniker, validator.valoper, config.chain.denom).set(bond)
            } catch (err) {
                console.log(`Error on ValidatorBondValidatorMetric! Msg: ${err}`)
            }
        })
    }
}

class ValidatorMissedBlocksValidatorMetric extends Metric {
    get() {
        config.validators.forEach(async validator => {

            try {
                const url = `${config.exporter.api}/cosmos/slashing/v1beta1/signing_infos/${validator.valcons}`;
                const req = await axios(url);
                const missedBlocks = req.data.val_signing_info.missed_blocks_counter * 1
                validator_missed_blocks_metric.labels(validator.moniker, validator.valcons).set(missedBlocks)
            } catch (err) {
                console.log(`Error on ValidatorMissedBlocksValidatorMetric! Msg: ${err}`)
            }
        })
    }
}

class ValidatorCommissionRateValidatorMetric extends Metric {
    get() {
        config.validators.forEach(async validator => {

            try {
                const url = `${config.exporter.api}/cosmos/staking/v1beta1/validators/${validator.valoper}`;
                const req = await axios(url);

                const commission = parseInt(req.data.validator.commission.commission_rates.rate * 100);
                validator_commission_rate_metric.labels(validator.moniker, validator.valoper).set(commission)
            } catch (err) {
                console.log(`Error on ValidatorCommissionRateValidatorMetric! Msg: ${err}`)
            }
        })
    }
}

class ValidatorCommissionValidatorMetric extends Metric {
    get() {
        config.validators.forEach(async validator => {

            try {
                const url = `${config.exporter.api}/cosmos/distribution/v1beta1/validators/${validator.valoper}/commission`
                const req = await axios(url);
                const rawCommission = req.data.commission.commission.find(
                    (commission) => commission.denom == config.chain.denom
                ).amount
                const commission = parseInt(rawCommission / Math.pow(10, config.chain.exponent))
                validator_commission_metric.labels(validator.moniker, validator.valoper, config.chain.denom).set(commission)
            } catch (err) {
                console.log(`Error on ValidatorCommissionValidatorMetric! Msg: ${err}`)
            }
        })
    }
}

class ValidatorRankValidatorMetric extends Metric {
    get() {
        config.validators.forEach(async validator => {

            try {
                // might be a good option to move this into dedicated function. But it's fine ...
                const checkValidator = `${config.exporter.api}/cosmos/staking/v1beta1/validators/${validator.valoper}`;
                const validatorData = await axios(checkValidator);
                const status = validatorData.data.validator.status == "BOND_STATUS_BONDED" ? 1 : 0;

                if (status == 0) {
                    return validator_rank_metric.set(0)
                }

                const url = `${config.exporter.api}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=400`
                const req = await axios(url);
                const activeValidators = req.data.validators;
                const sortedByTokens = activeValidators.sort((a, b) => b.tokens - a.tokens);
                const index = sortedByTokens.findIndex(
                    (val) => val.operator_address == validator.valoper
                );
                validator_rank_metric.labels(validator.moniker, validator.valoper).set(index+1)
            } catch (err) {
                console.log(`Error on ValidatorCommissionValidatorMetric! Msg: ${err}`)
            }
        })
    }
}

export class ValidatorCollector {
    metrics = [
        new ValidatorBondValidatorMetric,
        new ValidatorMissedBlocksValidatorMetric,
        new ValidatorCommissionRateValidatorMetric,
        new ValidatorIsActiveValidatorMetric,
        new ValidatorIsJailedValidatorMetric,
        new ValidatorCommissionValidatorMetric,
        new ValidatorRankValidatorMetric
    ]
    collectAll() {
        return this.metrics.forEach(metrics => metrics.collect())
    }
}


