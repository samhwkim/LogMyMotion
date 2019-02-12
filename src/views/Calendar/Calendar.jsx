import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
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
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { PanelGroup, Panel } from 'react-bootstrap';

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

  selectedEvent(event) {
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
    this.getSets(setsRef);

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
    return (
      <div className="main-content">
        {this.state.alert}
        <Rodal
          visible={this.state.summaryVisible}
          onClose={this.hideSummary.bind(this)}
          measure={"%"}
          width={80}
          height={80}
          >
          <div>Content</div>
        </Rodal>

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
