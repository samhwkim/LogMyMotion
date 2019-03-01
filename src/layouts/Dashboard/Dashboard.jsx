import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

// this is used to create scrollbars on windows devices like the ones from apple devices
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Sidebar from "../../components/Sidebar/Sidebar";

import { style } from "../../variables/Variables.jsx";

import dashboardRoutes from "../../constants/dashboard.jsx";
import { FirebaseContext, withFirebase } from '../../components/Firebase';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

var ps;
let events = [];
let goodScores = [];
let badScores = [];
let cueScoreSeries = [];
let savedUid = "";

let dataBar;
// let workoutCompletedToday = false;

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workoutCompletedToday: false
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.sleep = this.sleep.bind(this);
  }

  async fetchCalendarData(dbRef) {
    let snapshot = await dbRef.once("value");
    let today = new Date();

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        let dateArr = child.key.split("-");
        let workoutDate = new Date(dateArr[2], dateArr[0]-1, dateArr[1]);

        if (today.getFullYear() === workoutDate.getFullYear() && today.getDate() === workoutDate.getDate() && today.getMonth() === workoutDate.getMonth()) {
          this.setState({workoutCompletedToday: true});
        }

        for (let i = 0; i < child.numChildren(); i++) {
          //child.key is date
          var event = {
            title: "Workout " + (i+1),
            allDay: true,
            start: new Date(dateArr[2], dateArr[0]-1, dateArr[1]),
            end: new Date(dateArr[2], dateArr[0]-1, dateArr[1]),
            color: "default"
          };

          events.push(event);
        }
      });

    }
    else {
      console.log("No Dates Found");
    }
  }

  async fetchBarGraphData(dbRef) {
    let snapshot = await dbRef.once("value");
    if (snapshot.exists()) {
        let totalReps = snapshot.val().totalReps;

        let goodSD = snapshot.val().goodSDCount;
        let badSD = totalReps - goodSD;

        let goodSA = snapshot.val().goodSACount;
        let badSA = totalReps - goodSA;

        let goodFW = snapshot.val().goodFWCount;
        let badFW = totalReps - goodFW;

        let goodKA = snapshot.val().goodKACount;
        let badKA = totalReps - goodKA;

        goodScores = [goodSD, goodSA, goodFW, goodKA];
        badScores = [badSD, badSA, badFW, badKA];

        cueScoreSeries.push(goodScores);
        cueScoreSeries.push(badScores);
    }
    else {
      console.log("something is not right.");
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  async componentDidMount() {
    window.stub = this;
    events = [];
    goodScores = [];
    badScores = [];


    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.refs.mainPanel);
    }


    if (this.props.firebase.auth.currentUser === null) {
      console.log("user is null");
      await this.sleep(2000);
    } else {
      console.log("user identified");
      let currentUserUid = this.props.firebase.getCurrentUserUid();

      let workoutHistoryRef = this.props.firebase.dates(currentUserUid);
      this.fetchCalendarData(workoutHistoryRef);
    }
  }

  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
    }
  }

  componentDidUpdate(e) {
    if (navigator.platform.indexOf("Win") > -1) {
      setTimeout(() => {
        ps.update();
      }, 350);
    }

    if (e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainPanel.scrollTop = 0;
    }

    if (
      window.innerWidth < 993 &&
      e.history.action === "PUSH" &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
    }
  }

  async componentWillMount() {
    if (document.documentElement.className.indexOf("nav-open") !== -1) {
      document.documentElement.classList.toggle("nav-open");
    }

    cueScoreSeries = [];
    let currentUserUid = this.props.firebase.getCurrentUserUid();
    let cueScoreRef = this.props.firebase.generalStats(currentUserUid);
    await this.fetchBarGraphData(cueScoreRef);
    dataBar = {
      labels: [
        "Squat Depth",
        "Shoulder Alignment",
        "Feet Width",
        "Knee Angle",
      ],
      series: cueScoreSeries,
    };

  }
  render() {
    return (
      <div className="wrapper">
        <Sidebar {...this.props} />
        <div
          className={
            "main-panel" +
            (this.props.location.pathname === "/maps/full-screen-maps"
              ? " main-panel-maps"
              : "")
          }
          ref="mainPanel"
        >
          <Header {...this.props} />
          <Switch>
            {dashboardRoutes.map((prop, key) => {
              if (prop.collapse) {
                return prop.views.map((prop, key) => {
                    return (
                      <Route
                        path={prop.path}
                        component={prop.component}
                        key={key}
                      />
                    );

                });
              } else {
                if (prop.redirect)
                  return (
                    <Redirect from={prop.path} to={prop.pathTo} key={key} />
                  );
                else if(prop.events) {
                    return (
                      <Route
                        path={prop.path}
                        render={(props) => <prop.component {...props} events={events}/>}
                        key={key}

                      />
                    );
                } else if(prop.cueScores) {
                  return (
                    <Route
                      path={prop.path}
                      render={(props) => <prop.component {...props} dataBar={dataBar} challenge={this.state.workoutCompletedToday}/>}
                      key={key}
                    />
                  );
                }
                else
                  return (
                    <Route
                      path={prop.path}
                      component={prop.component}
                      key={key}
                    />
                  );
              }
            })}
          </Switch>
          <Footer fluid />
        </div>
      </div>
    );
  }
}

const DashboardFirebase = compose(
  withRouter,
  withFirebase
)(Dashboard)

export default DashboardFirebase;
// export default Dashboard;
