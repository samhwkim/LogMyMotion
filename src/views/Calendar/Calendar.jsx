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
import Button from '../../components/CustomButton/CustomButton.jsx';
import StarRatings from 'react-star-ratings';

import "rodal/lib/rodal.css";
const localizer = BigCalendar.momentLocalizer(moment);

// listOfSetData:
// each element will be a set
// each set will be a list of reps
// each rep will be a list of cue grades
let listOfSetData = [];

// retreive the blobs from Firebase Storage, then convert to videos!
let listOfBlobs = [];
let listOfTempVideos = [];
let listOfFinalVideos = [];

let listOfSDDonutData = [];
let listOfSADonutData = [];
let listOfFWDonutData = [];
let listOfKADonutData = [];

let globalWorkoutTitle = null;
let globalSetTitle = null;
let globalDate = null;
let uid = null;

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: events,
      summaryVisible: false,
      videos: [],
    };
  }

  createDonutData(dataLabels, dataSeries) {
    return {
      type: "Pie",
      data: {
        labels: dataLabels,
        series: dataSeries,
      },
      options: {
        donut: true
      }
    };
  }

  convertBlobToVideo() {
    for (let i = 0; i < listOfBlobs.length; i++) {
      let videoURL = window.URL.createObjectURL(listOfBlobs[i]);
      listOfTempVideos.push(videoURL);
    }
  }

  async getSets(ref) {
    let snapshot = await ref.once("value");
    if (snapshot.exists()) {
      const stub = [];
      snapshot.forEach((child) => {
        globalSetTitle = child.key;
        let set = {
          setData: child.val().setData,
          setScore: child.val().setScore,
          setCueScores: child.val().chartData,
          setRepCount: child.val().reps,
        };

        let SDOkayLabel;
        if (set.setCueScores[0][1] === 0) {
          SDOkayLabel = " ";
        } else {
          SDOkayLabel = "Okay";
        }

        let SDBadLabel;
        if (set.setRepCount - set.setCueScores[0][0] - set.setCueScores[0][1] === 0) {
          SDBadLabel = " ";
        } else {
          SDBadLabel = "Bad"
        }

        let SABadLabel;
        if (set.setRepCount - set.setCueScores[0][2] === 0) {
          SABadLabel = " ";
        } else {
          SABadLabel = "Bad";
        }

        let FWBadLabel;
        if (set.setRepCount - set.setCueScores[0][3] === 0) {
          FWBadLabel = " ";
        } else {
          FWBadLabel = "Bad";
        }

        let KABadLabel;
        if (set.setRepCount - set.setCueScores[0][4] === 0) {
          KABadLabel = " ";
        }
        else {
          KABadLabel = "Bad";
        }



        // Save data for the donut charts!
        let sdDonut = this.createDonutData([" ", " ", " "], [set.setCueScores[0][0], set.setRepCount - set.setCueScores[0][0] - set.setCueScores[0][1], set.setCueScores[0][1]]);
        let saDonut = this.createDonutData([" ", " "], [set.setCueScores[0][2], set.setRepCount - set.setCueScores[0][2]]);
        let fwDonut = this.createDonutData([" ", " "], [set.setCueScores[0][3], set.setRepCount - set.setCueScores[0][3]]);
        let kaDonut = this.createDonutData([" ", " "], [set.setCueScores[0][4], set.setRepCount - set.setCueScores[0][4]]);

        listOfSDDonutData.push(sdDonut);
        listOfSADonutData.push(saDonut);
        listOfFWDonutData.push(fwDonut);
        listOfKADonutData.push(kaDonut);

        listOfSetData.push(set);

        // retrieve respective video
        // console.log(`users/${uid}/workoutVideos/${globalDate}/${globalWorkoutTitle}/${globalSetTitle}/video`);
      //    stub.push(new Promise((resolve) => {
      //      this.props.firebase.createStorageRef(uid, globalDate, globalWorkoutTitle, globalSetTitle)
      //     .getDownloadURL()
      //     .then(async function(url) {
      //         var xhr = await new XMLHttpRequest();
      //         xhr.responseType = 'blob';
      //         xhr.onload = function(event) {
      //           var blob = xhr.response;
      //           listOfBlobs.push(blob);
      //           resolve();
      //         };
      //         xhr.open('GET', url);
      //         xhr.send();
      //
      //     }).catch(function(error) {
      //       // Handle any error
      //     })
      //   }));
      });
      // return Promise.all(stub);

    } else {
      console.log("no sets found");
    }
  }


  prepareVideoObjects() {
    let workoutVideo;
    for (let i = 0; i < listOfTempVideos.length; i++) {
      workoutVideo = (
        <video
          autoPlay
          loop
          style={{width: "100%" }}
          src={listOfTempVideos[i]}>
          Video is not available
        </video>
      );

      listOfFinalVideos.push(workoutVideo);
    }
  }

  componentDidMount() {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 1000);
  }

  async selectedEvent(event) {
    // Clear lists before population
    listOfSetData = [];
    listOfBlobs = [];
    listOfTempVideos = [];
    listOfFinalVideos = [];

    listOfSDDonutData = [];
    listOfSADonutData = [];
    listOfFWDonutData = [];
    listOfKADonutData = [];

    // Retrieve the current user uid
    let currentUserUid = this.props.firebase.getCurrentUserUid();
    uid = currentUserUid;

    // Retrieve and format the Firebase date title
    let date = event.start;
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let workoutDate = month + "-" + day + "-" + year;
    globalDate = workoutDate;

    // Retrieve and format the Firebase workout title
    let workoutNum = (event.title).toString().slice(-1);
    let workoutTitle = "workout_" + workoutNum;
    globalWorkoutTitle = workoutTitle;

    let setsRef = this.props.firebase.sets(currentUserUid, workoutDate, workoutTitle);
    await this.getSets(setsRef); // retrieves set info & set video

    // convert the downloaded blobs into videos (populates listOfTempVideos)
    // this.convertBlobToVideo();
    // prepare and define the video components (populates listOfFinalVideos)
    // this.prepareVideoObjects();

    console.log("summary clicked!!");
    this.showSummary();
  }

  showSummary() {
    this.setState({ summaryVisible: true });
  }

  hideSummary() {
    this.setState({ summaryVisible: false });
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

  handleSelect() {
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    function createDonutData(dataLabels, dataSeries) {
      return {
        type: "Pie",
        data: {
          labels: dataLabels,
          series: dataSeries,
        },
        options: {
          donut: true
        }
      };
    }

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
    let opt = {};
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
              {listOfSetData.map((prop, key) => {
                opt['eventKey'] = `set_${key+1}`;
                return <NavItem {...opt}>Set #{key+1}</NavItem>;
              })}
            </Nav>
          </Col>
          <Col sm={12}>
            <Tab.Content animation>
              {listOfSetData.map((prop, key) => {
                opt = {};
                opt['eventKey'] = `set_${key+1}`;
                opt['onEnter'] = this.handleSelect;
                return (
                  <Tab.Pane {...opt}>
                    <div align="center" style={{marginBottom: "20px"}}>
                      <StarRatings
                        rating={(listOfSetData[key].setScore/100 * 5)}
                        starRatedColor="gold"
                        changeRating={this.changeRating}
                        numberOfStars={5}
                        name='rating'
                      />
                    </div>
                    <Row>
                    <Col lg={3} sm={6}>
                      <Card
                        title={"Squat Depth"}
                        category={""}
                        content={
                          <ChartistGraph
                            data={listOfSDDonutData[key].data}
                            type={listOfSDDonutData[key].type}
                            options={listOfSDDonutData[key].options}
                          />
                        }
                      />
                    </Col>
                    <Col lg={3} sm={6}>
                      <Card
                        title={"Feet Width"}
                        category={""}
                        content={
                          <ChartistGraph
                            data={listOfFWDonutData[key].data}
                            type={listOfFWDonutData[key].type}
                            options={listOfFWDonutData[key].options}
                          />
                        }
                      />
                    </Col>
                    <Col lg={3} sm={6}>
                      <Card
                        title={"Shoulder Alignment"}
                        category={""}
                        content={
                          <ChartistGraph
                            data={listOfSADonutData[key].data}
                            type={listOfSADonutData[key].type}
                            options={listOfSADonutData[key].options}
                          />
                        }
                      />
                    </Col>
                    <Col lg={3} sm={6}>
                      <Card
                        title={"Knee Angle"}
                        category={""}
                        content={
                          <ChartistGraph
                            data={listOfKADonutData[key].data}
                            type={listOfKADonutData[key].type}
                            options={listOfKADonutData[key].options}
                          />
                        }
                      />
                    </Col>
                    </Row>
                    <SummaryTable
                      numReps={listOfSetData[key].setData.length}
                      repStatsList={listOfSetData[key].setData}
                      summaryStatus={this.state.summaryVisible}/>
                  </Tab.Pane>
                );
              })}
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
