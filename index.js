const { tokenBalance } = require('./tokenBalance');
const { ethBalance } = require('./ethBalance');
const { fetchLiquidityPools } = require('./checkDex');
const { buy } = require('./buy');
// const { test } = require('./test');
const { sell } = require('./sell');

require('dotenv').config();

const tokenAddress = process.env.TOKEN_ADDRESS;
const tokenAddress2 = process.env.TOKEN_ADDRESS2;
const walletAddress = process.env.WALLET_ADDRESS;
const dai = process.env.DAI;

async function main(){
    console.log("eth balance" ,  await ethBalance(walletAddress));
    const balance = await tokenBalance(walletAddress , tokenAddress);
    console.log(balance);
    // console.log(await fetchLiquidityPools("0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed"));
    buy(tokenAddress , 0.0005, process.env.PRIVATE_KEY);
    // test();
    // sell(dai , balance , process.env.PRIVATE_KEY );
}

main();