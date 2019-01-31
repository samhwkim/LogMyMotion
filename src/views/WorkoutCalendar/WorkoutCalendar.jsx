import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import { Grid, Row, Col } from "react-bootstrap";
import "react-big-calendar/lib/css/react-big-calendar.css";
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import { Card } from "../../components/Card/Card.jsx";
import { StatsCard } from "../../components/StatsCard/StatsCard.jsx";
import { Tasks } from "../../components/Tasks/Tasks.jsx";
import { AuthUserContext, withAuthorization } from '../../components/Session';

const localizer = BigCalendar.momentLocalizer(moment);

class WorkoutCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    }
  }

  onChange = date => this.setState({ date })

  render() {
    const cal_events = [];
    return (
      <AuthUserContext.Consumer>
          {authUser => (
            <div className="content" style={{ height: 700 }}>
              <BigCalendar
                localizer={localizer}
                events={cal_events}
                defaultView='month'
                views={['month']}
                defaultDate={new Date()}
                startAccessor="start"
                endAccessor="end"
              />
            </div>
          )}
        </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(WorkoutCalendar);
