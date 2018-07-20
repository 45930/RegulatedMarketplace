pragma solidity ^0.4.24;

contract Regulated {
    address internal regulator;

    constructor(address _regulator) public {
        regulator = _regulator;
    }

    event LogRegulatorSet(address indexed previousRegulator, address indexed newRegulator);
    function setRegulator(address newRegulator) public onlyRegulator {
        emit LogRegulatorSet(regulator, newRegulator);
        regulator = newRegulator;
    }

    function getRegulator() constant public returns(address) {
        return regulator;
    }

    modifier onlyRegulator() {
        require(msg.sender == regulator);
        _;
    }
}