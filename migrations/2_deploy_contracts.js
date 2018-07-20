var MarketRegulator = artifacts.require("./MarketRegulator.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(MarketRegulator).then(instance => {
    console.log("Instance: " + instance.address);
    let x = instance
      .deployMarket()
      .then(instance.registerNewCustomer(accounts[1]))
      .then(instance.registerNewCustomer(accounts[2]))
      .then(instance.registerNewCustomer(accounts[3]))
      .then(instance.registerNewWorker(accounts[4]))
      .then(instance.registerNewWorker(accounts[5]))
      .then(instance.registerNewWorker(accounts[6]));
  });
};
