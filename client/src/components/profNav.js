import "../styles/style.css";
import firebase from "../firebase.js";
import '@firebase/auth';
import { Link, Redirect } from "react-router-dom";
import { useState } from "react";

function ProfNav() {
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
                        <p><Link to="/prof/descriptions">Add Descriptions</Link></p>
                        <p><Link to="/prof/rank">Rank TA's</Link></p>
                        <p onClick={() => signOut()}>Sign Out</p>
                    </div>
                </div>
            }
        </div>
    );
  }
  
export default ProfNav;