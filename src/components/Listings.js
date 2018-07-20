import React, { Component } from "react";
import MarketPlaceContract from "../../build/contracts/MarketPlace.json";
import { Link } from "react-router-dom";

class Lisitngs extends Component {
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
      listings: []
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
    let listings = [];
    await marketPlaceInstance.getPastEvents(
      "LogNewListingCreated",
      { filter: {}, fromBlock: 0, toBlock: "latest" },
      (error, events) => {
        events.map(event => {
          let listing = {};
          listing["customer"] = event.returnValues.customer;
          listing["description"] = event.returnValues.description;
          listings.push(listing);
        });
      }
    );
    let listingsRender = [];
    let marketPlaceId = this.state.marketPlaceId.toString();
    await listings.map(async listing => {
      let desc = this.state.web3.utils.toHex(listing.description);
      listing = await marketPlaceInstance.methods
        .getListing(listing.customer, listing.description)
        .call({ from: this.state.cheaterAccounts.regulator });

      console.log(listing);
      listing.fee = await this.state.web3.utils.fromWei(listing.fee);
      switch (listing.status) {
        case "1":
          listing.status = "Posted";
          break;
        case "2":
          listing.status = "In Progress";
          break;
        case "3":
          listing.status = "Complete";
          break;
        case "4":
          listing.status = "Canceled";
          break;
      }
      let listingLink =
        "/listing/" +
        marketPlaceId +
        "/" +
        listing.customer +
        "/" +
        listing.description;

      listingsRender.push(
        <li key={listingLink}>
          <Link className="listingLink" to={listingLink}>
            <div>
              <p>Customer: {listing.customer}</p>
              <p>Title: {listing.title}</p>
              <p>Description: {listing.description}</p>
              <p>Fee: {listing.fee} ether</p>
              <p>Status: {listing.status}</p>
            </div>
            <hr />
          </Link>
        </li>
      );

      this.setState({
        marketPlaceInstance: marketPlaceInstance,
        listings: listingsRender
      });
    });
  }

  render() {
    return (
      this.state.listings.length > 0 && (
        <div className="pure-u-1-1">
          <ul>{this.state.listings}</ul>
        </div>
      )
    );
  }
}

export default Lisitngs;
