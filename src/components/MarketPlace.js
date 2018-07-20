import React, { Component } from "react";
import MarketPlaceContract from "../../build/contracts/MarketPlace.json";
import ContractInteraction from "./ContractInteraction";

class Regulator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: this.props.web3,
      cheaterAccounts: this.props.cheaterAccounts,
      netId: this.props.netId,
      marketPlaceId: this.props.match.params.marketPlaceId,
      marketPlaceInstance: {
        address: null
      }
    };
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

  render() {
    if (this.state.marketPlaceInstance._address) {
      return (
        <div className="pure-u-1-1">
          <ContractInteraction
            contractAddress={this.state.marketPlaceInstance._address || ""}
            contractAbi={MarketPlaceContract.abi}
            web3={this.state.web3}
            netId={this.state.netId}
            cheaterAccounts={this.state.cheaterAccounts}
          />
        </div>
      );
    } else {
      return <div className="pure-u-1-1" />;
    }
  }
}

export default Regulator;
