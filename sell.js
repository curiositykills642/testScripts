const {Web3} = require('web3'); // Correct import syntax
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_MAINET));
const BN = require('bn.js');

const routerAbi = require('./uniswapRouterAbi.json');
const { fetchLiquidityPools } = require('./checkDex');
const tokenAbi = require('./tokenAbi.json'); // Ensure this ABI includes the `decimals()` method.

async function sell(tokenAddress, amountTokens, privateKey) {

    const slippagePercent = 20; 

    const dex = await fetchLiquidityPools(tokenAddress);
    if(dex.success === 400){
        return dex.message;
    }
    // const routerAddress = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";
    const routerAddress = dex.message;

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
    const router = new web3.eth.Contract(routerAbi, routerAddress);

    const ethMap = {
        3: 'kwei',
        6 : 'mwei',
        9 : 'gwei',
        12 : 'szabo',
        15 : 'finney',
        18 : 'ether',
        21 : 'kether',
        24 : 'mether',
        27 : 'gether',
        30 : 'tether',
    };

    try {
        // Fetch decimals from the token contract
        console.log("check 1");
        const decimals = await tokenContract.methods.decimals().call();

        console.log("check 1.5");

        const path = [tokenAddress, process.env.WETH_ADDRESS]; // WETH address on mainnet

        console.log("amount tokens: ", amountTokens)

        let amountIn = 0;
        
        if(ethMap[decimals])
            amountIn = web3.utils.toWei(amountTokens , ethMap[decimals]);
        else{
            return {
                success : 400,
                message : "token not uspported"
            };
        } 
            
        console.log("check 2" , "  amount in : " , amountIn.toString());

        const from = account.address;
        const allowance = await tokenContract.methods.allowance(from, routerAddress).call();

        if(allowance)

        console.log("check 3");

        if (new BN(allowance).lt(new BN(amountIn).mul(new BN(5)))) {
            // Prepare the transaction object for approving token spend
            // Note: Ensure that the amount for approval is calculated as 5 times amountIn correctly
            const amountToApprove = new BN(amountIn).mul(new BN(5)).toString(); // Correct multiplication using bn.js and convert to string
        
            const approveTxData = tokenContract.methods.approve(routerAddress, amountToApprove).encodeABI();
        
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
        
        const estimatedOutput = await router.methods.getAmountsOut(amountIn, path).call();
        const estimatedOutputETH = estimatedOutput[1]; // this is in Wei
        const hundred = new BN(100);
        const minAmountOut = new BN(estimatedOutputETH).mul(hundred.sub(new BN(slippagePercent))).div(hundred).toString();
        console.log("minAmountOut : " , minAmountOut);
        // Prepare the swap transaction
        const tx = router.methods.swapExactTokensForETH(
            amountIn.toString(),
            minAmountOut,
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
