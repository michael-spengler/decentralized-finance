pragma solidity ^0.5.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v2.5.0/contracts/token/ERC20/ERC20.sol";

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v2.5.0/contracts/token/ERC20/ERC20Detailed.sol"; 

contract ContributorAssistantCoin is ERC20, ERC20Detailed { 
    constructor () public ERC20Detailed("ContributorAssistantCoin", "CAC", 18) { 
        _mint(msg.sender, 2000000 * (10 ** uint256(decimals()))); 
        
    }
}