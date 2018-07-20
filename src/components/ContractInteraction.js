import React, { Component } from "react";
import ContractFunction from "./ContractFunction";

class ContractInteraction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contractAddress: this.props.contractAddress,
      contractAbi: this.props.contractAbi,
      web3: this.props.web3,
      netId: this.props.netId,
      signingAccount: this.props.signingAccount,
      contractInstance: null
    };
  }

  async componentWillMount() {
    this.instantiateContract();
  }

  async instantiateContract() {
    const contractInstance = await new this.state.web3.eth.Contract(
      this.props.contractAbi,
      this.props.contractAddress
    );
    this.setState({
      contractInstance: contractInstance
    });
  }

  render() {
    if (this.state.contractInstance) {
      return (
        <div className="contract-interaction">
          <h3>Contract Address: {this.state.contractAddress}</h3>
          <ul className="contract-functions">
            {this.state.contractAbi
              .filter(el => {
                return el.type === "function";
              })
              .map(func => {
                return (
                  <li key={func.name}>
                    <ContractFunction
                      web3={this.state.web3}
                      netId={this.state.netId}
                      contractInstance={this.state.contractInstance}
                      func={func}
                      signingAccount={this.state.signingAccount}
                    />
                  </li>
                );
              })}
          </ul>
        </div>
      );
    } else {
      return <div className="contract-interaction" />;
    }
  }
}

export default ContractInteraction;
