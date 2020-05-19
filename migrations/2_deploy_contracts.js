const SkvToken = artifacts.require("SkvToken");
const SkvTokenSale = artifacts.require("SkvTokenSale")

module.exports = function(deployer) {
  deployer.deploy(SkvToken, 1000000).then(function(){
  	return  deployer.deploy(SkvTokenSale, SkvToken.address, 10000000000000);
  });
};
