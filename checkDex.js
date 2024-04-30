const axios = require('axios');

// Function to fetch data from DexScreener and find the best exchange quickly
async function fetchLiquidityPools(contractAddress) {
    const apiUrl = `https://api.dexscreener.io/latest/dex/tokens/${contractAddress}`;

    const dexRouter = {
        "uniswap" : "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
        "aerodrome" : "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
        "sushiswap" : "0x71524B4f93c58fcbF659783284E38825f0622859",
    }

    try {
        const response = await axios.get(apiUrl);
        const pairs = response.data.pairs;
        
        // Priority order of exchanges
        const priorityExchanges = ['uniswap', 'aerodrome', 'sushiswap'];

        // Variables to track the best found exchange
        let bestExchange = null;
        let highestVolume = 0;

        // Iterate over each pair and check if the quote token is WETH
        for (const pair of pairs) {
            if (pair.quoteToken.symbol === 'WETH' && priorityExchanges.includes(pair.dexId.toLowerCase())) {
                const currentVolume = parseFloat(pair.volume.h24);
                // Update bestExchange if the current pair has a higher volume than previously recorded
                if (currentVolume > highestVolume) {
                    bestExchange = pair.dexId;
                    highestVolume = currentVolume;
                }
            }
        }

        // Log and return the best exchange if found
        if (bestExchange) {
            console.log("best exchange found :" , bestExchange );
            return {
                message : dexRouter[bestExchange],
                success : 200,
            }
        } else {
            console.log('No exchanges found matching the criteria.');
            return {message : "no exchange found",
            success : 400 ,}
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

module.exports = { fetchLiquidityPools };
