const {Web3} = require('web3');
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_MAINNET));
const BN = require('bn.js');

const routerAbi = require('./uniswapRouterAbi.json');
const { fetchLiquidityPools } = require('./checkDex');

async function buy(tokenAddress, amountETH, privateKey) {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const slippage = 20; // Adjust slippage as necessary, typical values are 0.5% to 1%
    const amountIn = web3.utils.toWei(amountETH.toString(), 'ether');

    try {
        const dex = await fetchLiquidityPools(tokenAddress);
        if (dex.success === 400) {
            console.error("Error in fetching liquidity pools:", dex.message);
            return dex.message;
        }
        const routerAddress = dex.message;

        const router = new web3.eth.Contract(routerAbi, routerAddress);
        const path = [process.env.WETH_ADDRESS, tokenAddress];

        console.log("check -1", path);

        const amountsOut = await router.methods.getAmountsOut(amountIn, path).call();
        console.log("amountsOut", amountsOut);
        let amountOutMin = new BN(amountsOut[1]);
        amountOutMin = amountOutMin.mul(new BN(100 - slippage)).div(new BN(100));

        console.log("check -2", "Minimum amount out:", amountOutMin.toString());

        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
        const tx = router.methods.swapExactETHForTokens(amountOutMin.toString(), path, account.address, deadline);
        const gas = await tx.estimateGas({ from: account.address, value: amountIn });
        const gasPrice = await web3.eth.getGasPrice();

        console.log("check -3", "Gas Estimate:", gas, "Gas Price:", gasPrice);

        const signedTx = await web3.eth.accounts.signTransaction({
            from: account.address,
            to: routerAddress,
            data: tx.encodeABI(),
            gas: gas,
            gasPrice: gasPrice,
            value: amountIn
        }, privateKey);

        console.log("check -4");

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction receipt:', receipt.transactionHash);
    } catch (error) {
        console.error("Encountered an error during the buy process:", error);
    }
}

module.exports = { buy };
