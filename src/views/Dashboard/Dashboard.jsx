import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import {
  PanelGroup,
  Panel,
  Nav,
  NavItem,
  Tab,
  Grid,
  Row,
  Col
} from "react-bootstrap";

import Card from "../../components/Card/Card.jsx";
import { StatsCard } from "../../components/StatsCard/StatsCard.jsx";
import { Tasks } from "../../components/Tasks/Tasks.jsx";
import {
  dataPie,
  dataSales,
  optionsSales,
  responsiveSales,
  optionsBar,
  responsiveBar,
  table_data
} from "../../variables/Variables.jsx";
import { AuthUserContext, withAuthorization } from "../../components/Session";

const squatChallengesList = [
  "Complete 5 repetitions",
  "Complete a set with perfect squat depth for each rep",
  "Complete a set with perfect shoulder alignment for each rep",
  "Complete at least 10 perfect repetitions in one set",
  "Complete a set with perfect knee angle for each rep"
];

class Dashboard extends Component {
  render() {
    let cueHistoryGraph = (workout, eventKey) => (
      <Tab.Pane eventKey={eventKey}>
        <Card
          title={workout}
          content={
            <ChartistGraph
              data={this.props.dataBar}
              type="Bar"
              options={optionsBar}
              responsiveOptions={responsiveBar}
            />
          }
          legend={
            <div>
              <i className="fa fa-circle text-info" /> Good Cue
              <i className="fa fa-circle text-danger" /> Bad Cue
            </div>
          }
        />
      </Tab.Pane>
    );

    let challenges = (workout, eventKey, challengesList) => (
      <Tab.Pane eventKey={eventKey}>
        <Card
          title={workout}
          category="Complete the challenges below"
          content={
            <table className="table">
              <Tasks
                challengesList={challengesList}
                challengeCompleted={this.props.challenge}
              />
            </table>
          }
        />
      </Tab.Pane>
    );

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div className="main-content">
            <Grid fluid>
              {/* <Row>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-warning" />}
                statsText="10"
                statsIcon={<i className="fa fa-refresh" />}
                statsIconText="Days since last workout"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-wallet text-success" />}
                statsText="Revenue"
                statsValue="$1,345"
                statsIcon={<i className="fa fa-calendar-o" />}
                statsIconText="Last day"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-graph1 text-danger" />}
                statsText="Errors"
                statsValue="23"
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText="In the last hour"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-twitter text-info" />}
                statsText="Followers"
                statsValue="+45"
                statsIcon={<i className="fa fa-refresh" />}
                statsIconText="Updated now"
              />
            </Col>
          </Row> */}
              {/* <Row>
                <Col lg={150}>
                  <Card
                    title="Workout History"
                    category="Last 10 Workouts Performance"
                    content={
                      <ChartistGraph
                        data={dataSales}
                        type="Line"
                        options={optionsSales}
                        responsiveOptions={responsiveSales}
                      />
                    }
                    legend={
                      <div>
                        <i className="fa fa-circle text-info" /> Squat
                        <i className="fa fa-circle text-danger" /> Bench Press
                        <i className="fa fa-circle text-warning" /> Barbell
                        Press
                      </div>
                    }
                    stats={
                      <div>
                        <i className="fa fa-history" /> Updated 3 minutes ago
                      </div>
                    }
                  />
                </Col>
              </Row> */}
              <Row>
                <Col md={6}>
                  <Tab.Container id="tabs-with-dropdown" defaultActiveKey="1">
                    <Row className="clearfix">
                      <Col sm={12}>
                        <Nav bsStyle="tabs">
                          <NavItem eventKey="1">Squat</NavItem>
                          <NavItem eventKey="2">Bench Press</NavItem>
                          <NavItem eventKey="3">Barbell Rows</NavItem>
                        </Nav>
                      </Col>
                      <Col sm={12}>
                        <Tab.Content animation>
                          {cueHistoryGraph("Squat Cue History", "1")}
                        </Tab.Content>
                      </Col>
                    </Row>
                  </Tab.Container>
                </Col>
                <Col md={6}>
                  <Tab.Container id="tabs-with-dropdown" defaultActiveKey="1">
                    <Row className="clearfix">
                      <Col sm={12}>
                        <Nav bsStyle="tabs">
                          <NavItem eventKey="1">Squat</NavItem>
                          <NavItem eventKey="2">Bench Press</NavItem>
                          <NavItem eventKey="3">Barbell Rows</NavItem>
                        </Nav>
                      </Col>
                      <Col sm={12}>
                        <Tab.Content animation>
                          {challenges(
                            "Squat Challenges",
                            "1",
                            squatChallengesList
                          )}
                        </Tab.Content>
                      </Col>
                    </Row>
                  </Tab.Container>
                </Col>
              </Row>
              <Row>
                <Col lg={150}>
                  <Card
                    title="Workout History"
                    category="Last 10 Workouts Performance"
                    content={
                      <ChartistGraph
                        data={dataSales}
                        type="Line"
                        options={optionsSales}
                        responsiveOptions={responsiveSales}
                      />
                    }
                    legend={
                      <div>
                        <i className="fa fa-circle text-info" /> Squat
                        <i className="fa fa-circle text-danger" /> Bench Press
                        <i className="fa fa-circle text-warning" /> Barbell
                        Press
                      </div>
                    }
                    stats={
                      <div>
                        <i className="fa fa-history" /> Updated 3 minutes ago
                      </div>
                    }
                  />
                </Col>
              </Row>
            </Grid>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Dashboard);
