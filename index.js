const { tokenBalance } = require('./tokenBalance');
const { ethBalance } = require('./ethBalance');
const { fetchLiquidityPools } = require('./checkDex');
const { buy } = require('./buy');
// const { test } = require('./test');
const { sell } = require('./sell');

require('dotenv').config();

const tokenAddress = process.env.TOKEN_ADDRESS;
const walletAddress = process.env.WALLET_ADDRESS;
const dai = process.env.DAI;

console.log(dai)

async function main(){
    console.log("eth balance" ,  await ethBalance(walletAddress));
    // const balance = await tokenBalance(walletAddress , dai);
    // console.log(balance);
    // console.log(await fetchLiquidityPools("0x54Ea88F89f87F47607d5ffc1C7Daf0979BA15877"));
    buy(dai , 0.00001 , process.env.PRIVATE_KEY);
    // test();
    // sell(dai , 1 , process.env.PRIVATE_KEY );
}

main();