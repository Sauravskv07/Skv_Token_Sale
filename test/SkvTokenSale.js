var SkvTokenSale = artifacts.require('./SkvTokenSale.sol');
var SkvToken = artifacts.require('./SkvToken.sol');

contract('SkvTokenSale', function(accounts){
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokens = 750000
	var tokenPrice = 10000000000000; //in wei
	var numberOfTokens;
	var tokenInstance;
	it('initializes the contract with the correct values', function(){
		return SkvTokenSale.deployed().then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.address
		}).then(function(address){
			assert.notEqual(address,0x0,'has contract address');
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address,0x0,'has token contract address');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price, tokenPrice,'token price is set');
		})
	})

	it('facilitates token buying',()=>{
		return SkvToken.deployed().then(function(instance){
			tokenInstance = instance;
			return SkvTokenSale.deployed()
		}).then(function(instance){
			tokenSaleInstance = instance;
			return tokenInstance.transfer(tokenSaleInstance.address, tokens, {from: admin});
		}).then((receipt)=>{
			numberOfTokens = 10;
			var value = numberOfTokens * tokenPrice;
			return tokenSaleInstance.buyTokens(numberOfTokens,{ from: buyer, value: value } )
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,'triggers 1 event');
			assert.equal(receipt.logs[0].event,'Sell','should be a Sell event');
			assert.equal(receipt.logs[0].args._buyer,accounts[1],'logs the account that purchased the tokes');
			assert.equal(receipt.logs[0].args._amount, numberOfTokens,'logs the number Of Tokens purchased');
			return  tokenSaleInstance.tokenSold();
		}).then(function(amount){
			assert.equal(amount.toNumber(), numberOfTokens, 'increments to number of tokens Sold');
			return tokenInstance.balanceOf(tokenSaleInstance.address)
		}).then((balance)=>{
			//console.log('balance = ',balance);
			assert.equal(balance.toNumber(), tokens -numberOfTokens);
			return tokenInstance.balanceOf(accounts[1]);
		}).then((balance)=>{
			//console.log('balance = ',balance);
			assert.equal(balance, numberOfTokens, 'it transfers tokens to buyers');
			return tokenSaleInstance.buyTokens(numberOfTokens, {from :buyer, value: 1});
		}).then(assert.fail).catch(function(error){
			//console.log('error 1',error);
			assert(error.message.indexOf('revert') >=0, 'msg.value must equal number of tokens in wei');
			return tokenSaleInstance.buyTokens(800000, {from: accounts[1], value: 800000* tokenPrice});
		}).then(assert.fail).catch((error)=>{
			assert(error.message.indexOf('revert')>=0, 'amount of tokens not available for sale');			
		})
	})

	it('ends token sale',()=>{
		return SkvToken.deployed().then(function(instance){
			tokenInstance = instance;
			return SkvTokenSale.deployed()
		}).then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.endSale({from: buyer})
		}).then(assert.fail).catch((error)=>{
			assert(error.message.indexOf('revert')>=0, 'only admin can end the sale');
			return tokenSaleInstance.endSale({from: admin})
		}).then(function(receipt){
			//receipt
			return tokenInstance.balanceOf(admin);
		}).then((balance)=>{
			//console.log('balance',balance);
			assert.equal(balance.toNumber(),999990, 'returns all unsold tokens');
		})
	})
})
