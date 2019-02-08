import Dashboard from "../views/Dashboard/Dashboard";
import WorkoutCalendar from "../views/WorkoutCalendar/WorkoutCalendar";
import Typography from "../views/Typography/Typography";
import Icons from "../views/Icons/Icons";
import PoseNetDemo from "../components/MainPages/posenetdemo";


const dashboardRoutes = [
  {
    path: "/home",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard
  },
  {
    path: "/calendar",
    name: "Workout Calendar",
    icon: "pe-7s-date",
    component: WorkoutCalendar

  },
  {
    collapse: true,
    path: "/analyzer",
    name: "Analyzer",
    state: "openAnalyzer",
    icon: "pe-7s-gym",
    views: [
      {
        path: "/analyzer",
        name: "Squat",
        mini: "S",
        // component: Buttons
      },
      { path: "/analyzer", name: "Bench Press", mini: "BP"},
       {path: "/analyzer", name: "Barbell Press", mini: "BP"},
    ]
  },
  {
    path: "/tutorial",
    name: "Tutorial",
    icon: "pe-7s-bookmarks",
  },
  { redirect: true, path: "/", to: "/home", name: "Home" }
];

export default dashboardRoutes;
