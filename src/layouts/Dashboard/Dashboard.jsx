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

let workoutDates = [];
let workoutList = [];
let latestDates = [];
let lastFiveDates = [];
let latestWorkoutScores = [];

let savedUid = "";

let dataBar;
let lineGraphData;
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

  async getWorkoutScore(uid, date, workoutId, sets) {
    let total = 0;
    for (let i = 0; i < sets.length; i++) {
      // console.log(`${uid}/${date}/${workoutId}/${sets[i]}`);
      let setScoreRef = this.props.firebase.addSetScore(uid, date, workoutId, sets[i]);
      let setScoreSnap = await setScoreRef.once("value");
      // console.log(setScoreSnap.child("setScore").val());
      total += parseFloat(setScoreSnap.child("setScore").val());
    }

    latestDates.push(date);
    latestWorkoutScores.push((total/sets.length).toFixed(2));
  }

  async fetchLineGraphData() {
    let currentUserUid = this.props.firebase.getCurrentUserUid();
    // create a list of the last 5 workout dates.
    lastFiveDates = workoutDates.slice(Math.max(workoutDates.length - 5, 1));

    for (let i = 0; i < lastFiveDates.length; i++) {
      let dateRef = this.props.firebase.workouts(currentUserUid, lastFiveDates[i]);
      let snapshot = await dateRef.once("value");
       // child === workout_1, workout_2, etc...
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          // workout score is the average of the set scores!!
          // save the max set score from all workouts (ignore other sets) of each workout!
          let sets = Object.keys(child.val());
          let workoutScore = 0;


          this.getWorkoutScore(currentUserUid, lastFiveDates[i], child.key, sets);
          this.setState({a: "c"});
        });
      }


    }
  }

  async fetchCalendarData(dbRef) {
    let snapshot = await dbRef.once("value");
    let today = new Date();

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        let dateArr = child.key.split("-");
        let workoutDate = new Date(dateArr[2], dateArr[0]-1, dateArr[1]);

        workoutDates.push(child.key); // save the dates of workouts

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

        this.setState({a: "b"});
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
    workoutList = [];
    workoutDates = [];
    lastFiveDates = [];
    latestDates = [];
    latestWorkoutScores = [];

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
      await this.fetchCalendarData(workoutHistoryRef);
      await this.fetchLineGraphData();

      // trim the line graph arrays to be the last five dates and workouts
      latestDates = latestDates.slice(Math.max(latestDates.length - 5, 1));
      latestWorkoutScores = latestWorkoutScores.slice(Math.max(latestWorkoutScores.length - 5, 1));

      console.log(latestDates);
      console.log(latestWorkoutScores);

      lineGraphData =  {
        labels: latestDates,
        series: [
          latestWorkoutScores,
        ]
      };

      this.setState({a: 'a'});
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
    workoutList = [];
    workoutDates = [];
    lastFiveDates = [];
    latestDates = [];
    latestWorkoutScores = [];

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

    // await this.fetchLineGraphData();
    // // trim the line graph arrays to be the last five dates and workouts
    // latestDates = latestDates.slice(Math.max(latestDates.length - 5, 1));
    // latestWorkoutScores = latestWorkoutScores.slice(Math.max(latestWorkoutScores.length - 5, 1));
    //
    // console.log(latestDates);
    // console.log(latestWorkoutScores);
    //
    // lineGraphData =  {
    //   labels: latestDates,
    //   series: [
    //     latestWorkoutScores,
    //     [67, 152, 143, 240, 287, 335, 435, 437],
    //     [23, 113, 67, 108, 190, 239, 307, 308],
    //   ]
    // };

    this.setState({a: 'a'});

  }
  render() {
    console.log(lineGraphData);
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
                      render={(props) => <prop.component {...props} dataBar={dataBar} challenge={this.state.workoutCompletedToday} lineGraphData={lineGraphData}/>}
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
