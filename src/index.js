import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Component } from "react";
import Home from "./components/MainPages/home";
import PosenetDemo from "./components/MainPages/posenetdemo";
class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            {" "}
            <Route exact path="/posenetdemo" component={PosenetDemo} />
            <Route exact path="/" component={Home} />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
