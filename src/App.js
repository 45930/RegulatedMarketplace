import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Switch from "react-router-dom/Switch";

import getWeb3 from "./utils/getWeb3";

import CreateListing from "./components/CreateListing";
import Home from "./components/Home";
import Lisitng from "./components/Listing";
import Listings from "./components/Listings";
import MarketPlace from "./components/MarketPlace";
import Navbar from "./components/Navbar";
import Regulator from "./components/Regulator";

import MarketRegulatorContract from "../build/contracts/MarketRegulator.json";

import "./css/oswald.css";
import "./css/open-sans.css";
import "./css/pure-min.css";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      accounts: [],
      cheaterAccounts: {},
      netId: 0,
      defaultMarket: null
    };
  }

  async componentWillMount() {
    // Get web3 and accounts
    const web3 = await getWeb3;
    const accounts = await web3.web3.eth.getAccounts();
    const cheaterAccounts = {
      regulator: accounts[0],
      customers: accounts.slice(1, 4),
      workers: accounts.slice(4, 7)
    };
    const netId = await web3.web3.eth.net.getId();
    const regulator = MarketRegulatorContract.networks[netId].address;
    await this.setState({
      web3: web3.web3,
      accounts: accounts,
      cheaterAccounts: cheaterAccounts,
      netId: netId,
      regulator: regulator
    });
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

    this.setState({
      defaultMarket: markets[0]
    });
  }

  render() {
    if (!this.state.defaultMarket) {
      return <div className="App" />;
    } else {
      return (
        <Router>
          <div className="App">
            <Navbar defaultMarket={this.state.defaultMarket} />
            <main className="container">
              <div className="pure-g">
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route
                    exact
                    path="/admin"
                    render={() => (
                      <Regulator
                        web3={this.state.web3}
                        cheaterAccounts={this.state.cheaterAccounts}
                        netId={this.state.netId}
                        address={this.state.regulator}
                      />
                    )}
                  />
                  <Route
                    path="/marketplace/:marketPlaceId"
                    render={props => (
                      <MarketPlace
                        web3={this.state.web3}
                        cheaterAccounts={this.state.cheaterAccounts}
                        netId={this.state.netId}
                        regulator={this.state.regulator}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    path="/create_listing/:marketPlaceId/"
                    render={props => (
                      <CreateListing
                        web3={this.state.web3}
                        cheaterAccounts={this.state.cheaterAccounts}
                        netId={this.state.netId}
                        regulator={this.state.regulator}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    path="/listings/:marketPlaceId/"
                    render={props => (
                      <Listings
                        web3={this.state.web3}
                        cheaterAccounts={this.state.cheaterAccounts}
                        netId={this.state.netId}
                        regulator={this.state.regulator}
                        {...props}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/listing/:marketPlaceId/:customer/:description"
                    render={props => (
                      <Lisitng
                        web3={this.state.web3}
                        cheaterAccounts={this.state.cheaterAccounts}
                        netId={this.state.netId}
                        regulator={this.state.regulator}
                        {...props}
                      />
                    )}
                  />
                </Switch>
              </div>
            </main>
          </div>
        </Router>
      );
    }
  }
}

export default App;
