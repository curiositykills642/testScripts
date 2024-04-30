const {Web3} = require('web3'); // Correct import syntax
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_MAINET));
const BN = require('bn.js');
async function generateWallet() {

    console.log("wekjfnbs")

    try {
        const wallet = web3.eth.accounts.create();
        const walletAddress = wallet.address;
        const privateKey = wallet.privateKey;

        console.log(walletAddress)
        console.log(privateKey)

        return {
            success: true,
            walletAddress: walletAddress,
            privateKey: privateKey,
        }
    } catch (error) {
        return {
            success: false,
            error: error
        };
    }
}

generateWallet();