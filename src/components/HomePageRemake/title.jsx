import React from "react";
import ReactFullpage from "@fullpage/react-fullpage";

import Page1 from "./page1";
import Page2 from "./page2";
import Page3 from "./page3";
import Page4 from "./page4";

const SEL = "custom-section";
const SECTION_SEL = `.${SEL}`;

// NOTE: if using fullpage extensions/plugins put them here and pass it as props
const pluginWrapper = () => {
  /**
   * require('fullpage.js/vendors/scrolloverflow'); // Optional. When using scrollOverflow:true
   */
};

const originalColors = ["000000", "#e6f3fe", "#e6f3fe", "#e6f3fe"];

export default class Title extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionsColor: [...originalColors],
      fullpages: [
        { sectionPage: <Page1 /> },
        { sectionPage: <Page2 /> },
        { sectionPage: <Page3 /> },
        { sectionPage: <Page4 /> }
      ]
    };
  }

  onLeave(origin, destination, direction) {
    console.log("onLeave", { origin, destination, direction });
    // arguments are mapped in order of fullpage.js callback arguments do something
    // with the event
  }

  render() {
    const { fullpages } = this.state;

    if (!fullpages.length) {
      return null;
    }

    return (
      <div className="App">
        <ReactFullpage
          debug /* Debug logging */
          navigation
          anchors={["firstPage", "secondPage", "thirdPage"]}
          sectionSelector={SECTION_SEL}
          onLeave={this.onLeave.bind(this)}
          sectionsColor={this.state.sectionsColor}
          pluginWrapper={pluginWrapper}
          render={comp => (
            <ReactFullpage.Wrapper>
              {fullpages.map(({ sectionPage }) => (
                <div className={SEL}>{sectionPage}</div>
              ))}
            </ReactFullpage.Wrapper>
          )}
        />
      </div>
    );
  }
}
