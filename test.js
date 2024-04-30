const {Web3} = require('web3'); // Correct import syntax
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_MAINET));

const routerAbi = require('./uniswapRouterAbi.json');

const routerAddress = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";
const contract = new web3.eth.Contract(routerAbi, routerAddress);

async function test(){
    try {
        const amountIn = web3.utils.toWei('0.0001', 'ether');

        const path = [
            '0x4200000000000000000000000000000000000006',  // Address of the input token (e.g., WETH)
            process.env.TOKEN_ADDRESS   // Address of the output token (e.g., DAI)
        ];

        const amounts = await contract.methods.getAmountsOut(amountIn, path).call();
        console.log('Output amounts:', amounts);
        return amounts;
    } catch (error) {
        console.error('Error fetching output amounts:', error);
    }
}

// async function test(){
//     try {
//         const wethAddress = await contract.methods.WETH().call();
//         console.log('WETH Address:', wethAddress);
//         return wethAddress;
//     } catch (error) {
//         console.error('Error fetching WETH address:', error);
//     }
// }

module.exports = {test};