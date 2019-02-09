import Pages from "../layouts/Pages/Pages.jsx";
import Dashboard from "../layouts/Dashboard/Dashboard.jsx";
import LandingPage from "../components/MainPages/landingpage.js";
import Login from "../layouts/Pages/Pages.jsx";
import Signup from "../layouts/Pages/Pages.jsx";
import Analyzer from "../components/PoseNet";
import WorkoutCalendar from "../views/Calendar/Calendar";

var indexRoutes = [
  { path: "/", name: "Landing Page", component: LandingPage },
  { path: "/pages", name: "Pages", component: Pages },
  { path: "/home", name: "Home", component: Dashboard },
  { path: "/login", name: "Log In", component: Login },
  { path: "/signup", name: "Sign Up", component: Signup },
  { path: "/analyzer", name: "Analyzer", component: Analyzer },
  { path: "/calendar", name: "Workout Calendar", component: Dashboard },
];

export default indexRoutes;
