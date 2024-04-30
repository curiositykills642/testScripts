const { tokenBalance } = require('./tokenBalance');
const { ethBalance } = require('./ethBalance');
const { fetchLiquidityPools } = require('./checkDex');
const { buy } = require('./buy');
const { test } = require('./test');
const { sell } = require('./sell');

require('dotenv').config();

const tokenAddress = process.env.TOKEN_ADDRESS;
const walletAddress = process.env.WALLET_ADDRESS;
const dai = process.env.DAI;

// console.log(dai)

async function main(){
    // console.log( await ethBalance(walletAddress));
    // const balance = await tokenBalance(walletAddress , dai);
    // console.log(balance);
    // console.log(await fetchLiquidityPools(process.env.L2VE));
    // buy(dai , 0.0001 , "0x685a83b85755013af6e12b1d1a73c5d5296117ddca2f22cb4a88b686107de0ff");
    // test();
    // sell(tokenAddress , balance , "0x685a83b85755013af6e12b1d1a73c5d5296117ddca2f22cb4a88b686107de0ff" );
}

main();