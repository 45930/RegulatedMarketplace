# Regulated Market

This project demonstrates how a third party can regulate a marketplace, that is otherwise decentralized on ethereum and ipfs.  A regulator can verify both customers and workers, so that each side can trust the pool.

## Installation

This project uses vagrant to manage the ethereum dependencies for the VM.  Make sure you have vagrant and virtualbox installed, then:

1. Open 2 separate terminal windows, `vagrant ssh` into each.
 - Don't forget to change the synced folder in the vagrantfile
2. In the first window, change directories to `dapps` and `npm install`
3. In the other window, change directories to `dapps`, then `truffle develop`
4. In the same window, from the truffle develop prompt, type `migrate --reset`
5. Back to the first window, type `npm run start` to start the develoment server
6. In your host machine, run `ipfs daemon` (If you don't want to run a local daemon, you can change the code in `src/components/ipfs.js` but you might get issues with CORS)
6. In your host machine, go to http://localhost:3000 and interact with the app!

## Contract Descriptions

There are 2 main contracts at play:  `MarketRegulator.sol` and `MarketPlace.sol`.  A `MarketPlace` is regulated by a `MarketRegulator`.

### MarketRegulator

Has the following functions:

`event LogMarketDeployed(address indexed newMarket)`
`function deployMarket() onlyOwner public returns(address) {}` - Deploys a new instance of `MarketPlace`, and returns the address of that market.

`event LogNewWorkerRegistered(address indexed newWorker)`
`function registerNewWorker(address _worker) onlyOwner public {}` - Registers the address of a worker that is allowed to participate in the network

`function isWorker(address _worker) public view returns(bool) {}` - Returns whether or not an address is a registered worker

`event LogNewCustomerRegistered(address indexed newCustomer)`
`function registerNewCustomer(address _customer) onlyOwner public {}` - Registers the address of a customer that is allowed to participate in the network

`function isCustomer(address _customer) public view returns(bool) {}` - Returns whether or not an address is a registered customer

### MarketPlace

Has the following functions:

`event LogNewListingCreated(address indexed customer, string title, string description, uint timeout, uint fee)`
`function createListing(string _title, string _description, uint _timeout) public payable {}` - Called by a customer to create a new listing

`event LogNewProposal(bytes32 listing, address worker)`
`function proposeWork(address _customer, string _description, string _proposal) public {}` - Called by a worker to propose services

`event LogProposalRejected(bytes32 listing)`
`function rejectProposal(address _customer, string _description) public {}` - Called by a customer to reject the current proposal

`event LogProposalAccepted(bytes32 listing)`
`function acceptProposal(address _customer, string _description) public {}` - Called by a customer to accept a proposal

`event LogListingCancelled(bytes32 listing)`
`function cancelListing(address _customer, string _description) public {}` - Called by a customer to cancel a listing that is in progress and refund their money

`event LogWorkComplete(bytes32 listing)`
`function completeWork(address _customer, string _description) public {}` - Called by a customer to verify that work has been completed and pay the worker

`function getListingHash(address _customer, string _description) public pure returns(bytes32) {}`

`function getListing(address _customer, string desc) public view returns (address customer, address worker, address proposedWorker, string title, string description, string proposal, uint blockNumber, uint timeout, uint fee, Statuses status) {}`

`function isWorker(address _worker) public view returns(bool) {}`

`function isCustomer(address _customer) public view returns(bool) {}`

`function stringToBytes(string s) public pure returns (bytes) {}`

`function bytesToString(bytes b) public pure returns (string) {}`