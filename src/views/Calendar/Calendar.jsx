import React, { Component } from "react";
import { PanelGroup, Panel, Nav, NavItem, Tab, Grid, Row, Col } from 'react-bootstrap';
// react component used to create a calendar with events on it
import BigCalendar from "react-big-calendar";
// dependency plugin for react-big-calendar
import moment from "moment";
// react component used to create alerts
import SweetAlert from "react-bootstrap-sweetalert";
import { events } from "../../variables/Variables";
import Card from "../../components/Card/Card.jsx";
import Rodal from "rodal";
import { FirebaseContext, withFirebase } from '../../components/Firebase';
import SummaryTable from "../../components/SummaryTable";
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ChartistGraph from "react-chartist";

import "rodal/lib/rodal.css";
const localizer = BigCalendar.momentLocalizer(moment);

// listOfSetData:
// each element will be a set
// each set will be a list of reps
// each rep will be a list of cue grades
let listOfSetData = [];

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: events,
      alert: null,
      summaryVisible: false,
    };
    this.hideAlert = this.hideAlert.bind(this);
  }

  async getSets(ref) {
    let snapshot = await ref.once("value");
    if (snapshot.exists()) {
      snapshot.forEach((child) => {

        let set = {
          setData: child.val().setData,
          setScore: child.val().setScore,
        };

        listOfSetData.push(set);
      });
    } else {
      console.log("no sets found");
    }
  }

  async selectedEvent(event) {
    // Clear the main set list before population
    listOfSetData = [];
    // Retrieve the current user uid
    let currentUserUid = this.props.firebase.getCurrentUserUid();

    // Retrieve and format the Firebase date title
    let date = event.start;
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let workoutDate = month + "-" + day + "-" + year;

    // Retrieve and format the Firebase workout title
    let workoutNum = (event.title).toString().slice(-1);
    let workoutTitle = "workout_" + workoutNum;

    let setsRef = this.props.firebase.sets(currentUserUid, workoutDate, workoutTitle);
    await this.getSets(setsRef);

    console.log(listOfSetData);

    this.showSummary();
  }

  showSummary() {
    this.setState({ summaryVisible: true });
  }

  hideSummary() {
    this.setState({ summaryVisible: false });
  }

  addNewEventAlert(slotInfo) {
    this.setState({
      alert: (
        <SweetAlert
          input
          showCancel
          style={{ display: "block", marginTop: "-100px" }}
          title="Input something"
          onConfirm={e => this.addNewEvent(e, slotInfo)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
          cancelBtnBsStyle="danger"
        />
      )
    });
  }
  addNewEvent(e, slotInfo) {
    var newEvents = this.state.events;
    newEvents.push({
      title: e,
      start: slotInfo.start,
      end: slotInfo.end
    });
    this.setState({
      alert: null,
      events: newEvents
    });
  }
  eventColors(event, start, end, isSelected) {
    var backgroundColor = "rbc-event-";
    event.color
      ? (backgroundColor = backgroundColor + event.color)
      : (backgroundColor = backgroundColor + "default");
    return {
      className: backgroundColor
    };
  }
  hideAlert() {
    this.setState({
      alert: null
    });
  }
  render() {

    const graph_data = {
      type: "Bar",
      data: {
        labels: [
          "Squat Depth",
          "Feet Width",
          "Shoulder Alignment",
          "Knee Angle"
        ],
        series: [[10,15,20,2]]
      },
      options: {
        seriesBarDistance: 10,
        classNames: {
          bar: "ct-bar ct-azure"
        },
        axisX: {
          showGrid: false
        },
        axisY: {
          onlyInteger: true
        }
      },
      responsiveOptions: [
    [
      "screen and (max-width: 640px)",
      {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function(value) {
            return value[0];
          }
        }
      }
    ]
  ]
};


    const styles = {
      overflowY: "scroll",
      backgroundColor: "white"
    };

    let tabs;
    if (listOfSetData === undefined || listOfSetData.length == 0) {
    // array empty or does not exist
        console.log("NULL");
      tabs = null;
    } else {
      console.log("CREATING SUMM PAGE");
      tabs = (
      <Tab.Container id="tabs-with-dropdown" defaultActiveKey="set_1">
        <Row className="clearfix">
          <Col sm={12}>
            <Nav bsStyle="tabs">
              <NavItem eventKey="set_1">Set #1</NavItem>
              <NavItem eventKey="set_2">Set #2</NavItem>
              <NavItem eventKey="set_3">Set #3</NavItem>
              <NavItem eventKey="set_4">Set #4</NavItem>
            </Nav>
          </Col>
          <Col sm={12}>
            <Tab.Content animation>
              <Tab.Pane eventKey="set_1">
                <div align="center">Score: {(listOfSetData[0].setScore)} % </div>
                    <Card
                      title={"Cue Performance"}
                      category={"Bar Chart"}
                      content={
                        <ChartistGraph
                          data={graph_data.data}
                          type={graph_data.type}
                          options={graph_data.options}
                          responsiveOptions={graph_data.responsiveOptions}
                        />
                      }
                    />
                <SummaryTable
                  numReps={listOfSetData[0].setData.length}
                  repStatsList={listOfSetData[0].setData}
                  summaryStatus={this.state.summaryVisible}/>
              </Tab.Pane>
              <Tab.Pane eventKey="set_2">
                <SummaryTable/>
              </Tab.Pane>
              <Tab.Pane eventKey="set_3">
                <SummaryTable/>
              </Tab.Pane>
              <Tab.Pane eventKey="set_4">
                <SummaryTable/>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );
  }

    let workoutSummary;
    if(this.state.summaryVisible) {
      workoutSummary = (
        <Rodal
          visible={this.state.summaryVisible}
          onClose={this.hideSummary.bind(this)}
          measure={"%"}
          width={80}
          height={80}
          customStyles={styles}>
          <div>{tabs}</div>
        </Rodal>
      );
    }

    return (
      <div className="main-content">
        {this.state.alert}
        {workoutSummary}
        <Grid fluid>
          <Row>
            <Col md={13} mdOffset={0}>
              <Card
                calendar
                content={
                  <BigCalendar
                    selectable
                    events={this.props.events}
                    defaultView="month"
                    scrollToTime={new Date(1970, 1, 1, 6)}
                    defaultDate={new Date()}
                    onSelectEvent={event => this.selectedEvent(event)}
                    onSelectSlot={slotInfo => this.addNewEventAlert(slotInfo)}
                    eventPropGetter={this.eventColors}
                    localizer={localizer}
                  />
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

// export default Calendar;

const CalendarFirebase = compose(
  withRouter,
  withFirebase
)(Calendar)

export default CalendarFirebase;
