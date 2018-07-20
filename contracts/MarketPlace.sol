pragma solidity ^0.4.24;

import "./MarketRegulator.sol";
import "./Regulated.sol";
contract MarketPlace is Regulated {
    enum Statuses { Null, Posted, InProgress, Complete, Canceled }
    struct Listing {
        address customer;
        address worker;
        address proposedWorker;
        string title;
        string description; // ipfs hash
        string proposal; // ipfs hash
        uint blockNumber;
        uint timeout;
        uint fee;
        Statuses status;
    }

    mapping(bytes32 => Listing) internal listings; // hash(customer, ipfs hash of description) => Listing

    constructor(address _regulator) Regulated(_regulator) public {
        regulator = _regulator;
    }

    event LogNewListingCreated(address indexed customer, string title, string description, uint timeout, uint fee);
    function createListing(string _title, string _description, uint _timeout) public payable {
        require(msg.value > 0);
        require(isCustomer(msg.sender));
        bytes32 listingHash = keccak256(abi.encodePacked(msg.sender, _description));
        Listing memory newListing;
        newListing.customer = msg.sender;
        newListing.title = _title;
        newListing.description = _description;
        newListing.timeout = _timeout;
        newListing.fee = msg.value;
        newListing.status = Statuses.Posted;
        emit LogNewListingCreated(msg.sender, _title, _description, _timeout, msg.value);
        listings[listingHash] = newListing;
    }

    event LogNewProposal(bytes32 listing, address worker);
    function proposeWork(address _customer, string _description, string _proposal) public {
        bytes32 _listingHash = getListingHash(_customer, _description);
        require(isWorker(msg.sender));
        Listing storage _listing = listings[_listingHash];
        require(_listing.status == Statuses.Posted);
        _listing.proposedWorker = msg.sender;
        _listing.proposal = _proposal;
        emit LogNewProposal(_listingHash, msg.sender);
    }

    event LogProposalRejected(bytes32 listing);
    function rejectProposal(address _customer, string _description) public {
        bytes32 _listingHash = getListingHash(_customer, _description);
        require(isCustomer(msg.sender));
        Listing storage _listing = listings[_listingHash];
        require(_listing.status == Statuses.Posted);
        _listing.proposedWorker = 0;
        _listing.proposal = "";
        emit LogProposalRejected(_listingHash);
    }

    event LogProposalAccepted(bytes32 listing);
    function acceptProposal(address _customer, string _description) public {
        bytes32 _listingHash = getListingHash(_customer, _description);
        require(isCustomer(msg.sender));
        Listing storage _listing = listings[_listingHash];
        require(_listing.status == Statuses.Posted);
        _listing.worker = _listing.proposedWorker;
        _listing.blockNumber = block.number;
        _listing.status = Statuses.InProgress;
    }

    event LogListingCancelled(bytes32 listing);
    function cancelListing(address _customer, string _description) public {
        bytes32 _listingHash = getListingHash(_customer, _description);
        Listing storage _listing = listings[_listingHash];
        require(_listing.customer == msg.sender);
        require(_listing.status == Statuses.InProgress);
        require(_listing.blockNumber + _listing.timeout >= block.number);
        _listing.status = Statuses.Canceled;
        emit LogListingCancelled(_listingHash);
        msg.sender.transfer(_listing.fee);
    }

    event LogWorkComplete(bytes32 listing);
    function completeWork(address _customer, string _description) public {
        bytes32 _listingHash = getListingHash(_customer, _description);
        Listing storage _listing = listings[_listingHash];
        require(_listing.customer == msg.sender);
        require(_listing.status == Statuses.InProgress);
        _listing.status = Statuses.Complete;
        emit LogWorkComplete(_listingHash);
        _listing.worker.transfer(_listing.fee);
    }

    function getListingHash(address _customer, string _description) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_customer, _description));
    }

    function getListing(address _customer, string desc) public view returns (address customer,
        address worker,
        address proposedWorker,
        string title,
        string description,
        string proposal,
        uint blockNumber,
        uint timeout,
        uint fee,
        Statuses status) {
        bytes32 _listingHash = getListingHash(_customer, desc);
        Listing memory _listing = listings[_listingHash];
        return (_listing.customer,
            _listing.worker,
            _listing.proposedWorker,
            _listing.title,
            _listing.description,
            _listing.proposal,
            _listing.blockNumber,
            _listing.timeout,
            _listing.fee,
            _listing.status
        );
    }

    function isWorker(address _worker) public view returns(bool) {
        return MarketRegulator(regulator).isWorker(_worker);
    }

    function isCustomer(address _customer) public view returns(bool) {
        return MarketRegulator(regulator).isCustomer(_customer);
    }

    function stringToBytes(string s) public pure returns (bytes){
        bytes memory _bytes = bytes(s);
        return _bytes;
    }

    function bytesToString(bytes b) public pure returns (string){
        string memory _string = string(b);
        return _string;
    }
}