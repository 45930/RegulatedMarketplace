import React, { Component } from "react";
import MarketPlaceContract from "../../build/contracts/MarketPlace.json";
import ipfs from "./ipfs";

class Lisitng extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: this.props.web3,
      cheaterAccounts: this.props.cheaterAccounts,
      netId: this.props.netId,
      marketPlaceId: this.props.match.params.marketPlaceId,
      marketPlaceInstance: {
        address: null
      },
      customer: this.props.match.params.customer,
      description: this.props.match.params.description,
      worker: null,
      proposedWorker: null,
      title: null,
      blockNumber: null,
      timeout: null,
      fee: null,
      status: null,
      currentBlock: null,
      timeoutBlock: null,
      messsage: ""
    };

    this.submitProposal = this.submitProposal.bind(this);
    this.acceptProposal = this.acceptProposal.bind(this);
    this.rejectProposal = this.rejectProposal.bind(this);
    this.completeWork = this.completeWork.bind(this);
    this.cancelListing = this.cancelListing.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentWillMount() {
    await this.instantiateContract();
  }

  async instantiateContract() {
    const marketPlaceInstance = await new this.state.web3.eth.Contract(
      MarketPlaceContract.abi,
      this.state.marketPlaceId
    );

    const currentBlock = await this.state.web3.eth.getBlockNumber();

    // let desc = await this.state.web3.utils.toHex(this.state.description);
    let listing = await marketPlaceInstance.methods
      .getListing(this.state.customer, this.state.description)
      .call({ from: this.state.cheaterAccounts.regulator });

    if (Number(listing.blockNumber) > 0) {
      listing.timeoutBlock =
        Number(listing.blockNumber) + Number(listing.timeout);
    }

    listing.fee = await this.state.web3.utils.fromWei(listing.fee);

    if (
      listing.proposedWorker == "0x0000000000000000000000000000000000000000"
    ) {
      listing.proposedWorker = "No proposed worker yet!";
    }

    await ipfs.get(listing.description, async (err, resp) => {
      this.setState({
        descriptionText: (
          <p>
            {resp[0].content
              .toString()
              .split("\n")
              .map((item, key) => {
                return (
                  <span key={key}>
                    {item}
                    <br />
                  </span>
                );
              })}
          </p>
        )
      });
    });
    console.log(listing);
    this.setState({
      marketPlaceInstance: marketPlaceInstance,
      currentBlock: currentBlock
    });
    await this.setState(listing);
  }

  async submitProposal() {
    this.setState({
      messsage: "Applying... hang tight"
    });
    let desc = this.state.description;
    let buffer = await Buffer.from(this.state.proposalText);
    await ipfs.add(buffer, async (err, ipfsHash) => {
      console.log(err, ipfsHash);
      await this.setState({ ipfsHash: ipfsHash[0].hash });
      const tx = await this.state.marketPlaceInstance.methods
        .proposeWork(this.state.customer, desc, this.state.ipfsHash)
        .send({ from: this.state.cheaterAccounts.workers[0], gas: 5000000 });
      this.setState({
        messsage: "Done!"
      });
    });
  }

  async acceptProposal() {
    let desc = this.state.description;
    await this.state.marketPlaceInstance.methods
      .acceptProposal(this.state.customer, desc)
      .send({ from: this.state.customer, gas: 5000000 });
  }

  async rejectProposal() {
    let desc = this.state.description;
    await this.state.marketPlaceInstance.methods
      .rejectProposal(this.state.customer, desc)
      .send({ from: this.state.customer, gas: 5000000 });
  }

  async completeWork() {
    let desc = this.state.description;
    let tx = await this.state.marketPlaceInstance.methods
      .completeWork(this.state.customer, desc)
      .send({ from: this.state.customer, gas: 5000000 });
    console.log(tx);
  }

  async cancelListing() {
    let desc = this.state.description;
    let tx = await this.state.marketPlaceInstance.methods
      .cancelListing(this.state.customer, desc)
      .send({ from: this.state.customer, gas: 5000000 });
    console.log(tx);
  }

  async handleChange(event) {
    let stateObject = this.state;
    stateObject[event.target.id] = event.target.value;
    this.setState(stateObject);
  }

  render() {
    let ipfsUrl = "https://ipfs.infura.io/ipfs/" + this.state.description;
    let proposalUrl = "https://ipfs.infura.io/ipfs/" + this.state.proposal;
    let workerDiv;
    if (this.state.proposal == "") {
      workerDiv = (
        <div>
          <h3>For Worker</h3>
          <label>Proposal:</label>
          <textarea
            id="proposalText"
            placeholder="proposalText"
            value={this.state.proposalText}
            autoComplete="off"
            rows="15"
            cols="85"
            onChange={this.handleChange}
          />
          <button className="button" onClick={this.submitProposal}>
            Apply to work on this listing
          </button>
          {this.state.messsage}
        </div>
      );
    }
    switch (this.state.status) {
      case "1":
        return (
          <div className="pure-u-1-1">
            <div>
              <div>
                <h2>Description:</h2>
                {this.state.descriptionText}
              </div>
              <div>
                <h2>Listing Info</h2>
                <p>Customer: {this.state.customer}</p>
                <p>Proposed Worker: {this.state.proposedWorker}</p>
                <p>
                  Proposal Hash: <a href={proposalUrl}>{this.state.proposal}</a>
                </p>
                <p>Title: {this.state.title}</p>
                <p>
                  Description Hash:{" "}
                  <a href={ipfsUrl}>{this.state.description}</a>
                </p>

                <p>Timeout: {this.state.timeout}</p>
                <p>Fee: {this.state.fee}</p>
              </div>
            </div>
            <div>
              {workerDiv}
              <div>
                <h3>For Customer</h3>
                <button className="button" onClick={this.acceptProposal}>
                  Accept current proposal
                </button>
                <button className="button" onClick={this.rejectProposal}>
                  Reject current proposal
                </button>
              </div>
            </div>
          </div>
        );
      case "2":
        return (
          <div className="pure-u-1-1">
            <div>
              <div>
                <h2>Description:</h2>
                {this.state.descriptionText}
              </div>
              <div>
                <h2>Listing Info</h2>
                <p>Customer: {this.state.customer}</p>
                <p>Worker: {this.state.worker}</p>
                <p>
                  Description Hash:{" "}
                  <a href={ipfsUrl}>{this.state.description}</a>
                </p>
                <p>
                  Proposal Hash: <a href={proposalUrl}>{this.state.proposal}</a>
                </p>
                <p>Current Block: {this.state.currentBlock}</p>
                <p>Timeout block: {this.state.timeoutBlock}</p>
                <p>Fee: {this.state.fee}</p>
              </div>
            </div>
            <div>
              <div>
                <h3>For Customer</h3>
                <button className="button" onClick={this.completeWork}>
                  Complete listing and process payment
                </button>
                <button className="button" onClick={this.cancelListing}>
                  Cancel listing and return payment
                </button>
              </div>
            </div>
          </div>
        );
      case "3":
        return (
          <div className="pure-u-1-1">
            <h2>This listing is complete</h2>
            <div>
              <h2>Description:</h2>
              {this.state.descriptionText}
            </div>
            <div>
              <h2>Listing Info</h2>
              <p>Customer: {this.state.customer}</p>
              <p>Completed by: {this.state.worker}</p>
              <p>
                Description Hash: <a href={ipfsUrl}>{this.state.description}</a>
              </p>
              <p>
                Proposal Hash: <a href={proposalUrl}>{this.state.proposal}</a>
              </p>
              <p>Fee: {this.state.fee}</p>
            </div>
          </div>
        );
      case "4":
        return (
          <div className="pure-u-1-1">
            <h2>This listing is canceled</h2>
            <div>
              <h2>Description:</h2>
              {this.state.descriptionText}
            </div>
            <div>
              <h2>Listing Info</h2>
              <p>Customer: {this.state.customer}</p>
              <p>Worker before cancellation: {this.state.worker}</p>
              <p>
                Description Hash: <a href={ipfsUrl}>{this.state.description}</a>
              </p>
              <p>
                Proposal Hash: <a href={proposalUrl}>{this.state.proposal}</a>
              </p>
              <p>Fee: {this.state.fee}</p>
            </div>
          </div>
        );
      default:
        return <div />;
    }
  }
}

export default Lisitng;
