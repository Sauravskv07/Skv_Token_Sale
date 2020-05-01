pragma solidity >=0.4.21 <0.7.0;

contract SkvToken{
	
	string public name = "SkvToken";
	string public symbol = "SKV";
	uint256 public totalSupply;
	mapping(address => uint256) public balanceOf;
	mapping(address =>mapping(address => uint256)) public allowance;

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
		);

	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
		);


	constructor(uint256 _initialSupply) public{
		
		totalSupply = _initialSupply;//state variable
		balanceOf[msg.sender] = _initialSupply;//allocate the initial supply
	}

	function transfer(address _to,uint256 _value) public payable returns(bool success){

		require(balanceOf[msg.sender]>= _value);

		balanceOf[msg.sender]-= _value;
		balanceOf[_to]+=_value;

		emit Transfer(msg.sender,_to,_value);

		return true;
	}

	function approve(address _spender, uint256 _value) public payable returns (bool success){

		allowance[msg.sender][_spender]=_value;
		
		emit Approval(msg.sender,_spender,_value);

		return true;
	}

	function transferFrom(address _from,address _to,uint256 _value) public payable returns (bool success){
	
		require(balanceOf[_from] >= _value);

		require(allowance[_from][msg.sender]>=_value);

		allowance[_from][msg.sender]-=_value;

		balanceOf[_from]-=_value;
		balanceOf[_to]+=_value;

		emit Transfer(_from,_to,_value);

		return true;
	}
	//approve allow someone to spend x ammount of token on your behalf
	//transfer on behalf
	//alloted amount to approve to spend
}
