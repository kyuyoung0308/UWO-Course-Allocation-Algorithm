import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import AddCourses from "./components/adminCourses";
import AddDescriptions from "./components/profDescriptions";
import Login from "./components/login";
import Register from "./components/adminRegister";
import MatchingTA from "./components/adminMatching";
import AdminInfo from "./components/adminInfo";
import ProfInfo from  "./components/profInfo";
import TAHours from "./components/tahours";

function App() {
  
  return (
    <div>
      <Router>
        <Switch> 
          <Route path="/admin/register">
            <Register />
          </Route>
          <Route path="/admin/courses">
            <AddCourses />
          </Route>
          <Route path="/admin/matchTA">
            <MatchingTA />
          </Route>
          <Route path = "/admin/uploadInfo">
            <AdminInfo />
          </Route>
          <Route path = "/admin/hours">
            <TAHours />
          </Route>
          <Route path="/prof/descriptions">
            <AddDescriptions />
          </Route>
          <Route path="/prof/rank">
            <ProfInfo />
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
