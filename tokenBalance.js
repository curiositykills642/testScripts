const {Web3} = require('web3'); // Correct import syntax
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_MAINET));
const tokenAbi = require('./tokenAbi.json'); // Ensure this ABI includes the `decimals()` method.

async function tokenBalance(walletAddress , tokenAddress){

    const contract = new web3.eth.Contract(tokenAbi, tokenAddress)

    const bal = await contract.methods.balanceOf(walletAddress).call();
    const resultInEther = web3.utils.fromWei(bal, 'ether'); // Convert balance to ether (decimal 18)
    return resultInEther;
}

module.exports = { tokenBalance };
