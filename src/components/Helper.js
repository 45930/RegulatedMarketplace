import React, { Component } from "react";

class Helper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: this.props.accounts
    };
  }

  render() {
    return <div>{this.state.accounts}</div>;
  }
}

export default Helper;
