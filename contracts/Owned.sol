pragma solidity ^0.4.24;

contract Owned {
    address internal owner;

    constructor() public {
        owner = msg.sender;
    }

    event LogOwnerSet(address indexed previousOwner, address indexed newOwner);
    function setOwner(address newOwner) public onlyOwner returns(bool success) {
        require(newOwner != 0);
        require(newOwner != msg.sender);
        emit LogOwnerSet(msg.sender, newOwner);
        owner = newOwner;
        return true;
    }

    function getOwner() constant public returns(address _owner) {
        return owner;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

}