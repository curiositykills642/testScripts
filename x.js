const BN = require('bn.js');  // Ensure bn.js is required at the top of your script

async function sell(tokenAddress, amountTokens, privateKey, slippagePercent = 0.5) { // Default slippage is 0.5%
    const dex = await fetchLiquidityPools(tokenAddress);
    if(dex.success === 400){
        return dex.message;
    }
    const routerAddress = dex.message;

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    const router = new web3.eth.Contract(routerAbi, routerAddress);

    try {
        const decimals = await tokenContract.methods.decimals().call();
        const path = [tokenAddress, process.env.WETH_ADDRESS]; // WETH address on mainnet
        let amountIn = 0;
        if(ethMap[decimals])
            amountIn = web3.utils.toWei(amountTokens, ethMap[decimals]);
        else {
            return {
                success : 400,
                message : "Token not supported"
            };
        }

        const from = account.address;
        const allowance = await tokenContract.methods.allowance(from, routerAddress).call();

        if (new BN(allowance).lt(new BN(amountIn).mul(new BN(5)))) {
            const amountToApprove = new BN(amountIn).mul(new BN(5)).toString();
            const approveTxData = tokenContract.methods.approve(routerAddress, amountToApprove).encodeABI();
            const approveTx = {
                from: from,
                to: tokenAddress,
                data: approveTxData,
                gas: '100000',
                gasPrice: await web3.eth.getGasPrice()
            };
            const signedApproveTx = await web3.eth.accounts.signTransaction(approveTx, privateKey);
            await web3.eth.sendSignedTransaction(signedApproveTx.rawTransaction);
        }       

        // Estimate the output amount
        const estimatedOutput = await router.methods.getAmountsOut(amountIn, path).call();
        const estimatedOutputETH = estimatedOutput[1]; // this is in Wei

        // Calculate minimum amount out based on slippage
        const hundred = new BN(100);
        const minAmountOut = new BN(estimatedOutputETH).mul(hundred.sub(new BN(slippagePercent))).div(hundred).toString();

        const tx = router.methods.swapExactTokensForETH(
            amountIn.toString(),
            minAmountOut,
            path,
            from,
            Math.floor(Date.now() / 1000) + 60 * 20
        );

        const gas = await tx.estimateGas({ from });
        const gasPrice = await web3.eth.getGasPrice();

        const signedTx = await web3.eth.accounts.signTransaction({
            from: from,
            to: routerAddress,
            data: tx.encodeABI(),
            gas,
            gasPrice,
            value: '0'
        }, privateKey);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction receipt:', receipt.transactionHash);
    } catch (error) {
        console.error('Error in selling process:', error);
    }
}

module.exports = { sell };
