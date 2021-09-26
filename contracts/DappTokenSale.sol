pragma solidity ^0.4.2;
import "./DappToken.sol";

contract DappTokenSale {

    // admin has no public, don't expose it
    address admin;
    DappToken public tokenContract;
    uint public tokenPrice;
    uint public tokensSold;

    event Sell(
        address _buyer, uint _amount
    );


    constructor(DappToken _tokenContract, uint _tokenPrice) public {
        // Assign an admin
        // Token Contract
        // Token Price
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;

    }

    function multiply(uint x, uint y) internal pure returns(uint z) {
         require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

    // buy tokens, public because why not
    // expose it in frontend you idiot
    // payable because we want someone to send ether via transaction

    function buyTokens(uint _numberOfTokens) public payable {
            // require that value is equal to tokens
            // require that the contract has enough tokens
            // require that a transfer is successful
            // keep track of number of tokens sold
            // trigger a sell event

            require(msg.value == multiply(_numberOfTokens, tokenPrice));
            require(tokenContract.balanceOf(this) >= _numberOfTokens);

            // this is the actual buy functionality
            require(tokenContract.transfer(msg.sender, _numberOfTokens));

            tokensSold += _numberOfTokens;
            emit Sell(msg.sender, _numberOfTokens);
    }

    // ending token sale

    function endSale() public {
        // require admin
        // transfer remaining dapp tokens to admin
        // destroy contract

        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));
        selfdestruct(admin);
    }
}