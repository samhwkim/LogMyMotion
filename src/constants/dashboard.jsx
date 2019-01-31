import Dashboard from "../views/Dashboard/Dashboard";
import WorkoutCalendar from "../views/WorkoutCalendar/WorkoutCalendar";
import UserProfile from "../views/UserProfile/UserProfile";
import TableList from "../views/TableList/TableList";
import Typography from "../views/Typography/Typography";
import Icons from "../views/Icons/Icons";
import Maps from "../views/Maps/Maps";
import Upgrade from "../views/Upgrade/Upgrade";
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
    path: "/analyzer",
    name: "Analyzer",
    icon: "pe-7s-gym",
  },
  {
    path: "/tutorial",
    name: "Tutorial",
    icon: "pe-7s-bookmarks",
  },
  {
    upgrade: true,
    path: "/upgrade",
    name: "Upgrade to PRO",
    icon: "pe-7s-rocket",
  },
  { redirect: true, path: "/", to: "/home", name: "Home" }
];

export default dashboardRoutes;
