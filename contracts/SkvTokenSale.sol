pragma solidity >=0.4.21 <0.7.0;

import './SkvToken.sol';

contract SkvTokenSale {

	address payable admin;

	SkvToken public tokenContract;

	uint256 public tokenPrice;

	uint256 public tokenSold;

	event Sell(
		address _buyer,
		uint256 _amount
		);

	constructor (SkvToken _tokenContract, uint256 _tokenPrice) public{

		admin = msg.sender;

		tokenContract = _tokenContract;
	
		tokenPrice = _tokenPrice;

	}

	//multiply
	function multiply(uint x, uint y) internal pure returns (uint z){
		require(y == 0 || (z = x * y) / y == x);
	}

	function buyTokens(uint256 _numberOfTokens) public payable {

			require(msg.value == multiply(_numberOfTokens, tokenPrice));

			require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

			require(tokenContract.transfer(msg.sender, _numberOfTokens));
	
			tokenSold += _numberOfTokens;

			emit Sell(msg.sender, _numberOfTokens);	

	}

	function endSale() public {
		require(msg.sender == admin);
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
		selfdestruct(admin);
		//only admin can do this
		//tranfer the remaining back to admin
		//destroy contract
	}
}