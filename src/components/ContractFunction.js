import React, { Component } from "react";

class Contractfunction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: this.props.web3,
      netId: this.props.netId,
      signingAccount: this.props.signingAccount,
      contractInstance: this.props.contractInstance,
      func: this.props.func,
      inputs: this.props.func.inputs.map(x => {
        return null;
      }),
      result: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.submitTx = this.submitTx.bind(this);
  }

  async handleChange(idx, event) {
    const newInputs = this.state.inputs.map((input, oldIdx) => {
      if (idx === oldIdx) {
        if (this.state.func.inputs[idx].type === "address") {
          return this.state.web3.utils.toChecksumAddress(
            event.target.value.toString()
          );
        }
        return event.target.value;
      }
      return input;
    });
    this.setState({
      inputs: newInputs
    });
  }

  convertInputType(_fromType) {
    if (_fromType === "uint") {
      return "number";
    } else {
      return "text";
    }
  }

  async submitTx() {
    var method = this.state.func.name;
    var inputs = this.state.inputs.join(",");
    let result;
    if (inputs.length === 0) {
      console.log("No params for " + method);
      if (this.state.func.constant) {
        console.log("Calling " + method);
        result = await this.state.contractInstance.methods[method]().call({
          from: this.state.signingAccount,
          gas: 5000000
        });
      } else {
        console.log("sending " + method);
        result = await this.state.contractInstance.methods[method]().send({
          from: this.state.signingAccount,
          gas: 5000000
        });
      }
    } else {
      console.log("Calling " + method + " with params: " + inputs);
      if (this.state.func.constant) {
        console.log("Calling " + method);
        result = await this.state.contractInstance.methods[method](inputs).call(
          {
            from: this.state.signingAccount,
            gas: 5000000
          }
        );
      } else {
        console.log("sending " + method);
        result = await this.state.contractInstance.methods[method](inputs).send(
          {
            from: this.state.signingAccount,
            gas: 5000000
          }
        );
      }
    }
    console.log(result);
    if (result.status === true) {
      result = "Done";
    } else if (result.status === false) {
      result = "Failed";
    }
    this.setState({
      result: result.toString()
    });
    return true;
  }

  render() {
    if (this.state.func.inputs) {
      return (
        <div>
          {this.state.func.inputs.map((input, idx) => {
            return (
              <input
                id={input.name}
                key={input.name}
                placeholder={input.name}
                type={this.convertInputType(input.type)}
                autoComplete="off"
                onChange={event => this.handleChange(idx, event)}
              />
            );
          })}
          <button className="button" onClick={this.submitTx}>
            {this.state.func.name}
          </button>
          {this.state.result}
        </div>
      );

      // this.state.func.inputs is an ordered list of function inputs
      // form should give the user an input box per function input
      // form should call or send function with the inputs provided on submit
    } else {
      return <div />;
    }
  }
}

export default Contractfunction;
