import "../styles/style.css";
import firebase from "../firebase.js";
import '@firebase/auth';
import { Link, Redirect } from "react-router-dom";
import { useState } from "react";

function AdminNav() {
    const [bool, setBool] = useState(false);

    function signOut() {
        firebase.auth().signOut().then(() => {
            setBool(true);
          }).catch((error) => {
            alert("error");
          });          
    }

    return (
        <div>
            {
                bool ?
                <Redirect to="/" />
                :
                <div className="navbar">
                    <p>Engineering TA's</p>
                    <div className ="nav-body">
                        <p><Link to="/admin/uploadInfo">Upload Info</Link></p>
                        <p><Link to="/admin/hours">TA Hours</Link></p>
                        <p><Link to="/admin/courses">Add Courses</Link></p>
                        <p><Link to="/admin/matchTA">Match TA's</Link></p>
                        <p><Link to="/admin/register">New Accounts</Link></p>
                        <p onClick={() => signOut()}>Sign Out</p>
                    </div>
                </div>
            }
        </div>
    );
  }
  
export default AdminNav;