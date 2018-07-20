import React, { Component } from "react";
import MarketPlaceContract from "../../build/contracts/MarketPlace.json";
import ipfs from "./ipfs";

class CreateListing extends Component {
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
      description: "",
      fee: 0,
      timeout: 0,
      messsage: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.submitTx = this.submitTx.bind(this);
  }

  async componentWillMount() {
    await this.instantiateContract();
  }

  async instantiateContract() {
    const marketPlaceInstance = await new this.state.web3.eth.Contract(
      MarketPlaceContract.abi,
      this.state.marketPlaceId
    );
    this.setState({
      marketPlaceInstance: marketPlaceInstance
    });
  }

  async handleChange(event) {
    let stateObject = this.state;
    stateObject[event.target.id] = event.target.value;
    this.setState(stateObject);
  }

  async submitTx() {
    this.setState({
      messsage: "Sending... don't leave"
    });
    let buffer = await Buffer.from(this.state.description);
    await ipfs.add(buffer, async (err, ipfsHash) => {
      console.log(err, ipfsHash);
      await this.setState({ ipfsHash: ipfsHash[0].hash });
      const tx = await this.state.marketPlaceInstance.methods
        .createListing(
          this.state.title,
          this.state.ipfsHash,
          this.state.timeout
        )
        .send({
          from: this.state.cheaterAccounts.customers[0],
          value: this.state.web3.utils.toWei(this.state.fee),
          gas: 5000000
        });
      this.setState({
        messsage: "Done!"
      });
    });
  }

  render() {
    if (this.state.marketPlaceInstance._address) {
      return (
        <div className="pure-u-1-1">
          <h2>Submit your listing</h2>
          <form>
            <label>Title:</label>
            <input
              id="title"
              placeholder="title"
              type="text"
              value={this.state.title}
              autoComplete="off"
              onChange={this.handleChange}
            />
            <br />
            <label>Description:</label>
            <textarea
              id="description"
              placeholder="description"
              value={this.state.description}
              autoComplete="off"
              rows="15"
              cols="85"
              onChange={this.handleChange}
            />
            <br />
            <label>Fee:</label>
            <input
              id="fee"
              placeholder="fee"
              type="number"
              value={this.state.fee}
              autoComplete="off"
              onChange={this.handleChange}
            />
            <br />
            <label>Timeout:</label>
            <input
              id="timeout"
              placeholder="timeout"
              type="number"
              value={this.state.timeout}
              autoComplete="off"
              onChange={this.handleChange}
            />
            <br />
          </form>
          <button
            className="button"
            disabled={!this.state.description && !this.state.fee}
            onClick={this.submitTx}
          >
            Create
          </button>
          {this.state.messsage}
        </div>
      );
    } else {
      return <div className="pure-u-1-1" />;
    }
  }
}

export default CreateListing;
