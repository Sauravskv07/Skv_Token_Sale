const SkvToken = artifacts.require("SkvToken");

module.exports = function(deployer) {
  deployer.deploy(SkvToken, 1000000);
};
