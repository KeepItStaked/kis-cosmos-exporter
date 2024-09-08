import axios from 'axios'

export const getWalletBalance = async(api, {address, denom}) => {
  if (!address || !denom || !api) return 0;

  const url = `${api}/cosmos/bank/v1beta1/balances/${address}`;
  const req = await axios(url);
  return req.data.balances.find((a) => a.denom == denom).amount;
}

export const getRewardsByAddress = async(api, {address, denom}) => {
  const url = `${api}/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
  const req = await axios(url);
  return req.data.total.reduce(
    (acc, reward) =>
      reward.denom == denom ? (acc += reward.amount * 1) : false,
    0
  );
}