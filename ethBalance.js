const {Web3} = require('web3'); // Correct import syntax
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_MAINET));


async function ethBalance(walletAddress){
    const balanceInWei = await web3.eth.getBalance(walletAddress); // Get balance in wei
    const balanceInEther = web3.utils.fromWei(balanceInWei, 'ether'); // Convert balance to ether
    return balanceInEther;
}

module.exports = { ethBalance };

