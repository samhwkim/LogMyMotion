import Dashboard from "../views/Dashboard/Dashboard";
import Calendar from "../views/Calendar/Calendar.jsx";
import Typography from "../views/Typography/Typography";
import Icons from "../views/Icons/Icons";


const dashboardRoutes = [
  {
    path: "/home",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard,
    cueScores: true
  },
  {
    path: "/calendar",
    name: "Workout Calendar",
    icon: "pe-7s-date",
    component: Calendar,
    events: true
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
      },
      { path: "/analyzer", name: "Bench Press", mini: "BP"},
       {path: "/analyzer", name: "Barbell Rows", mini: "BR"},
    ]
  },
  {
    path: "/tutorial",
    name: "Tutorial",
    icon: "pe-7s-bookmarks",
  },

];

export default dashboardRoutes;
