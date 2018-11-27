import React from "react";
import ReactDOM from "react-dom";
//import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Component } from "react";
import Home from "./components/MainPages/home";

class App extends Component {
  render() {
    return (
      <div>
        <Home />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
