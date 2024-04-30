const {Web3} = require('web3'); // Correct import syntax
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_MAINET));
const BN = require('bn.js');

const routerAbi = require('./uniswapRouterAbi.json');
const { fetchLiquidityPools } = require('./checkDex');
const tokenAbi = require('./tokenAbi.json'); // Ensure this ABI includes the `decimals()` method.
const { type } = require('os');

async function sell(tokenAddress, amountTokens, privateKey) {


    const dex = await fetchLiquidityPools(tokenAddress);
    if(dex.success === 400){
        return dex.message;
    }
    const routerAddress = dex.message;

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    const router = new web3.eth.Contract(routerAbi, routerAddress);

    try {
        // Fetch decimals from the token contract
        console.log("check 1");
        const decimals = await tokenContract.methods.decimals().call();

        console.log("check 1.5");

        const path = [tokenAddress, process.env.WETH_ADDRESS]; // WETH address on mainnet

        console.log("amount tokens: ", typeof parseFloat(amountTokens))

        const amountIn = new BN(parseFloat(amountTokens)).mul(new BN(10).pow(new BN(decimals)));

        console.log("check 2");

        const from = account.address;

        const allowance = await tokenContract.methods.allowance(from, routerAddress).call();

        console.log("check 3");

        if (new BN(allowance).lt(amountIn)) {
            // Prepare the transaction object for approving token spend
            const approveTxData = tokenContract.methods.approve(routerAddress, amountIn.toString()).encodeABI();
            
            const approveTx = {
                from: from,
                to: tokenAddress, // Address of the token contract
                data: approveTxData,
                gas: '100000', // Set an appropriate gas limit
                gasPrice: await web3.eth.getGasPrice() // Fetch current gas price
            };
        
            // Sign the transaction
            const signedApproveTx = await web3.eth.accounts.signTransaction(approveTx, privateKey);
            
            // Send the signed transaction
            const approveReceipt = await web3.eth.sendSignedTransaction(signedApproveTx.rawTransaction);
            console.log(`Approval transaction hash: ${approveReceipt.transactionHash}`);
        }        

        // Prepare the swap transaction
        const tx = router.methods.swapExactTokensForETH(
            amountIn.toString(),
            '0',
            path,
            from,
            Math.floor(Date.now() / 1000) + 60 * 20
        );
        
        console.log("check 4");

        const gas = await tx.estimateGas({ from });
        console.log("check 4.5");
        const gasPrice = await web3.eth.getGasPrice();

        console.log("check 5");

        // Sign and send the transaction
        const signedTx = await web3.eth.accounts.signTransaction({
            from: from,
            to: routerAddress,
            data: tx.encodeABI(),
            gas,
            gasPrice,
            value: '0'
        }, privateKey);

        console.log("check 6");
        // Execute the transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction receipt:', receipt.transactionHash);
    } catch (error) {
        console.error('Error in selling process:', error);
    }
}

module.exports = { sell };
