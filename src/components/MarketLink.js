import React, { Component } from "react";
import { Link } from "react-router-dom";

class MarketLink extends Component {
  constructor(props) {
    super(props);

    this.state = {
      address: this.props.address
    };
  }

  render() {
    const link = "/marketplace/" + this.state.address;
    return (
      <Link className="link" to={link}>
        {this.state.address}
      </Link>
    );
  }
}

export default MarketLink;
