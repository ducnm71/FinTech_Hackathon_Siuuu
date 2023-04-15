// https://eth-goerli.g.alchemy.com/v2/NCQvK307tDqim_HgXe-l52pTpNKXdvjc

require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/NZM_oLHG63QFRe_7RYcYfSwqFGEO0v8S',
      accounts: ['0bc80ce5ab6b264b671f37c8fe84007dcb53624f8c33d13f48da36a7973461b4']
    }
  }
}