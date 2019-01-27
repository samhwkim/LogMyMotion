import Dashboard from "../views/Dashboard/Dashboard";
import UserProfile from "../views/UserProfile/UserProfile";
import TableList from "../views/TableList/TableList";
import Typography from "../views/Typography/Typography";
import Icons from "../views/Icons/Icons";
import Maps from "../views/Maps/Maps";
import Notifications from "../views/Notifications/Notifications";
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
    path: "/log",
    name: "Workout Log",
    icon: "pe-7s-note2",
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
