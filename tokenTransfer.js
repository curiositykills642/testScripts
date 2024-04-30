const {Web3} = require('web3'); // Correct import syntax
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_MAINET));

const accountFrom = {
    address: "0xe27F788FD38487C7e0BFE0e328a026117F35EA28", // Your account address
    privateKey: '0x685a83b85755013af6e12b1d1a73c5d5296117ddca2f22cb4a88b686107de0ff' // Your private key
};

const toAddress = '0xd4bB5A42E187AC5611B243a2dE4A84203Dfd162a'; // Address to receive the Ether
const transferAmount = web3.utils.toWei(0.009, 'ether'); // Amount of Ether to transfer

const transferEther = async () => {
    const txCount = await web3.eth.getTransactionCount(accountFrom.address);
    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(21000), // Typical gas limit for ETH transfer
        gasPrice: web3.utils.toHex(10e9), // Use appropriate gas price
        to: toAddress,
        from: accountFrom.address,
        value: web3.utils.toHex(transferAmount)
    };

    const signPromise = web3.eth.accounts.signTransaction(txData, accountFrom.privateKey);
    signPromise.then((signedTx) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log)
        .on('error', console.error);
    }).catch((err) => {
        console.log(err);
    });
};

transferEther();
