import React, { Component } from "react";
import MarketRegulatorContract from "../../build/contracts/MarketRegulator.json";
import ContractInteraction from "./ContractInteraction";
import MarketLink from "./MarketLink";

class Regulator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: this.props.web3,
      cheaterAccounts: this.props.cheaterAccounts,
      netId: this.props.netId,
      marketRegulatorInstance: {
        address: null
      },
      markets: [],
      customers: [],
      workers: [],
      balance: null
    };
  }

  async componentWillMount() {
    await this.instantiateContract();
  }

  async instantiateContract() {
    const marketRegulatorInstance = await new this.state.web3.eth.Contract(
      MarketRegulatorContract.abi,
      MarketRegulatorContract.networks[this.state.netId].address
    );
    let markets = [];
    await marketRegulatorInstance.getPastEvents(
      "LogMarketDeployed",
      { filter: {}, fromBlock: 0, toBlock: "latest" },
      function(error, events) {
        events.map(event => {
          const market = event.returnValues.newMarket;
          markets.push(market);
        });
      }
    );
    await markets.map(async (market, idx) => {
      let marketBalance = await this.state.web3.eth.getBalance(market);
      marketBalance = await this.state.web3.utils.fromWei(marketBalance);
      markets[idx] = (
        <li key={market}>
          <MarketLink address={market} /> - {marketBalance} ether
        </li>
      );
      this.setState({
        markets: markets
      });
    });
    let customers = [];
    await marketRegulatorInstance.getPastEvents(
      "LogNewCustomerRegistered",
      { filter: {}, fromBlock: 0, toBlock: "latest" },
      function(error, events) {
        events.map(event => {
          const customer = event.returnValues.newCustomer;
          customers.push(customer);
        });
      }
    );
    await customers.map(async (customer, jdx) => {
      let customerBalance = await this.state.web3.eth.getBalance(customer);
      customerBalance = await this.state.web3.utils.fromWei(customerBalance);

      customers[jdx] = (
        <li key={customer}>
          {customer} - {customerBalance} ether
        </li>
      );
      this.setState({
        customers: customers
      });
    });
    let workers = [];
    await marketRegulatorInstance.getPastEvents(
      "LogNewWorkerRegistered",
      { filter: {}, fromBlock: 0, toBlock: "latest" },
      function(error, events) {
        events.map(event => {
          const worker = event.returnValues.newWorker;
          workers.push(worker);
        });
      }
    );
    await workers.map(async (worker, kdx) => {
      let workerBalance = await this.state.web3.eth.getBalance(worker);
      workerBalance = await this.state.web3.utils.fromWei(workerBalance);

      workers[kdx] = (
        <li key={worker}>
          {worker} - {workerBalance} ether
        </li>
      );
      this.setState({
        workers: workers
      });
    });

    this.setState({
      marketRegulatorInstance: marketRegulatorInstance
    });
  }

  render() {
    if (this.state.marketRegulatorInstance._address) {
      return (
        <div className="pure-u-1-1">
          <ContractInteraction
            contractAddress={this.state.marketRegulatorInstance._address || ""}
            contractAbi={MarketRegulatorContract.abi}
            web3={this.state.web3}
            netId={this.state.netId}
            signingAccount={this.state.cheaterAccounts.regulator}
          />
          <div>
            <h2>Deployed Markets:</h2>
            <ul>{this.state.markets}</ul>
          </div>
          <div>
            <h2>Verified Customers:</h2>
            <ul>{this.state.customers}</ul>
          </div>
          <div>
            <h2>Verified Workers:</h2>
            <ul>{this.state.workers}</ul>
          </div>
        </div>
      );
    } else {
      return <div className="pure-u-1-1" />;
    }
  }
}

export default Regulator;
