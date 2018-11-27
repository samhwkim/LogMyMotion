import React, { Component } from "react";

import "../../css/footer.css";
export default class Footer extends Component {
  render() {
    return (
      <div>
        <section id="footer">
          <div className="container-fluid">
            <div className="row copyright-social">
              <div className="col-xs-12" />
              <p id="copyright">
                Copyright @ Pretty Lil Leetcoders - University of California,
                Santa Barbara
              </p>
              <p id="contact"> Contact us at: PrettyLilLeetcoders@gmail.com</p>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
