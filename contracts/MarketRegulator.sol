pragma solidity ^0.4.24;

import "./MarketPlace.sol";
import "./Owned.sol";
contract MarketRegulator is Owned{
    mapping(address => bool) workers;
    mapping(address => bool) customers;

    constructor() public {}

    event LogMarketDeployed(address indexed newMarket);
    function deployMarket() onlyOwner public returns(address) {
        address newMarket = address(new MarketPlace(address(this)));
        emit LogMarketDeployed(newMarket);
        return newMarket;
    }

    event LogNewWorkerRegistered(address indexed newWorker);
    function registerNewWorker(address _worker) onlyOwner public {
        require(!isWorker(_worker));
        emit LogNewWorkerRegistered(_worker);
        workers[_worker] = true;
    }

    function isWorker(address _worker) public view returns(bool) {
        return (_worker != 0 && workers[_worker]);
    }

    event LogNewCustomerRegistered(address indexed newCustomer);
    function registerNewCustomer(address _customer) onlyOwner public {
        require(!isWorker(_customer));
        emit LogNewCustomerRegistered(_customer);
        customers[_customer] = true;
    }

    function isCustomer(address _customer) public view returns(bool) {
        return (_customer != 0 && customers[_customer]);
    }
}