var SkvToken= artifacts.require("./SkvToken.sol");

contract('SkvToken',function(accounts){

	var tokenInstance;

	it('initializes the contract with the correct value',function(){
		return SkvToken.deployed().then(function(instance){
			tokenInstance=instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name,'SkvToken','initializes the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol){
			assert.equal(symbol,'SKV','initializes the correct Symbol')
		})
	})

	it('sets the total supply upon deployment',function(){
		return SkvToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply){
			assert.equal(totalSupply.toNumber(),1000000,"set the total supply to 1000000");
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance){
			assert.equal(adminBalance.toNumber(),1000000,'it allocates the initial supply to the admin account');
		})
	})

	it('tranfers token ownership',function(){
		return SkvToken.deployed().then(function(instance){
			tokenInstance=instance;
			return tokenInstance.transfer.call(accounts[1],9999999999999);
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >=0, 'error message must contain revert');
			return tokenInstance.transfer.call(accounts[1],25000,{from: accounts[0]});
		}).then(function(success){
			assert(success,true,'it returns true');
			return tokenInstance.transfer(accounts[1], 25000,{from: accounts[0]});
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,'triggers 1 event');
			assert.equal(receipt.logs[0].event,'Transfer','should be a Transfer event');
			assert.equal(receipt.logs[0].args._from,accounts[0],'logs the account the tokens are transfered from');
			assert.equal(receipt.logs[0].args._to,accounts[1],'logs the account the tokens are transfered to');
			assert.equal(receipt.logs[0].args._value,25000,'logs the transfered amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance){
			assert.equal(balance.toNumber(),25000,'adds the amount to the recieving account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance){
			assert.equal(balance.toNumber(),975000,'corresponding balance deducted');
		})
	})

	it('approves token for delegated transfer', function(){
		return SkvToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1],100);
		}).then(function(success){
			assert.equal(success,true,'it returns true');
			return tokenInstance.approve(accounts[1],100);
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,'triggers 1 event');
			assert.equal(receipt.logs[0].event,'Approval','should be a Approve event');
			assert.equal(receipt.logs[0].args._owner,accounts[0],'logs the account the tokens are approved from');
			assert.equal(receipt.logs[0].args._spender,accounts[1],'logs the account the tokens are alloted to');
			assert.equal(receipt.logs[0].args._value,100,'logs the transfered amount');		
			return tokenInstance.allowance(accounts[0],accounts[1]);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(),100,'stores the allowance for the delegated transfer');
		})
	})

	it('handles delegated transfer',function(){
		return SkvToken.deployed().then(function(instance){
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			return tokenInstance.transfer(fromAccount, 100, { from: accounts[0]});
		}).then(function(receipt){
			return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
		}).then(function(receipt){
			return tokenInstance.transferFrom(fromAccount, toAccount, 9999,{ from: spendingAccount});
		}).then(assert.fail).catch(function(error){
			//console.log(error);
			assert(error.message.indexOf('revert')>=0, 'cannot tranfer value more than approved');
			return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert')>=0, 'cannot tranfer value more than present in from account')
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10,{ from: spendingAccount});
		}).then(function(success){
			assert(success, true, 'transaction successful');
			return tokenInstance.transferFrom(fromAccount, toAccount, 10,{ from: spendingAccount});
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,'triggers 1 event');
			assert.equal(receipt.logs[0].event,'Transfer','should be a Transfer event');
			assert.equal(receipt.logs[0].args._from,fromAccount,'logs the account the tokens are transfered from');
			assert.equal(receipt.logs[0].args._to,toAccount,'logs the account the tokens are transfered to');
			assert.equal(receipt.logs[0].args._value,10,'logs the transfered amount');
			return tokenInstance.balanceOf(fromAccount)
		}).then(function(balance){
			assert.equal(balance.toNumber(),90,' deducts the ammount from the from account');
			return tokenInstance.allowance(fromAccount,spendingAccount);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(),0, 'deducts the alloted amount to spend');
		})
	})
})