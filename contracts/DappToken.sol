pragma solidity ^0.4.2;

contract DappToken {
    string public name = "Alvin Token";
    string public symbol = "ALT";
    string public standard = "ALT Token v1.0";
    uint256 public totalSupply;

    // transfer

    mapping(address => uint256) public balanceOf;

    mapping(address => mapping(address => uint256)) public allowance;
    // allowance

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor (uint256 _initialSupply) public {
        // msg.sender is the account that deployed the contract
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer
    // Exception if account does not have enough
    // Return a boolean
    // Transfer event
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require (balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);
        return true;
    }

    // delegated transfer
    // approve
    // if im account A, i want to approve account B -> spender
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // look for mapping first address is the owner, second is the spender he authorized
        allowance[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    } 

    // transferFrom

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // require _from has enough tokens
        // require allowance is big enough
        // change the balance
        // update the allowance
        // Transfer event
        // return a boolean
        require (_value <= balanceOf[_from]);
        require (_value <= allowance[_from][msg.sender]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        Transfer(_from, _to, _value);
        return true;
    }
    // 
    // 2:10
    // 2:49
    // 4:44:47
}