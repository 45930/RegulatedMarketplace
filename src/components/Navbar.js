import React, { Component } from "react";
import { Link } from "react-router-dom";

class Navbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      defaultMarket: this.props.defaultMarket
    };
  }

  render() {
    const listingsLink = "/listings/" + this.state.defaultMarket;
    const createListingLink = "/create_listing/" + this.state.defaultMarket;
    // const listingsLink =
    //   "/marketplace/" + this.state.defaultMarket + "/create_listing";
    return (
      <nav className="navbar pure-menu pure-menu-horizontal">
        <Link className="link" to="/">
          Home
        </Link>
        <Link className="link" to="/admin">
          Admin
        </Link>
        <Link className="link" to={listingsLink}>
          Listings
        </Link>
        <Link className="link" to={createListingLink}>
          Create New Listing
        </Link>
      </nav>
    );
  }
}

export default Navbar;
