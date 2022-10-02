import "../styles/style.css";
import firebase from "../firebase.js";
import '@firebase/auth';
import { useRef, useState } from "react";
import { Redirect } from "react-router-dom";
const db = firebase.firestore();

function AddDescriptions() {
    const userRef = useRef();
    const passRef = useRef();
    const errRef = useRef();
    const [loginState, setLoginState] = useState([false, false]); 

    async function handleClick() {
      try {
        await firebase.auth().signInWithEmailAndPassword(userRef.current.value, passRef.current.value);
        //see if current user is an admin 
        let uid = firebase.auth().currentUser.uid;
        let uidBool = await db.collection('admin').where('uid', '==', uid).get();
        if(uidBool.empty) {
          setLoginState([true, false]);
        }
        else {
          //Go to admin portal
          setLoginState([true, true]);
        }
      } catch (error) {
        errRef.current.classList.add("show");
        console.log(error);
      }
    }
    //code if logged in, redirect to dashboard?
    return (
      <div>
        {
          loginState[0] ?
            loginState[1] ?
            <Redirect to="/admin/matchTA" />
            :
            <Redirect to="/prof/descriptions" />
          :
          <div className="center matchTA">
            <div className="box">
              <p className="title"><strong>Login Page</strong></p>
              <label>Username</label>
              <input type="text" ref={userRef} />
              <br />
              <label>Password</label>
              <input type="password" ref={passRef} />
              <p className="error" ref={errRef}>Incorrect Password or Username!</p>
              <button onClick={() => handleClick()}>Login</button>
            </div>
          </div>
        }
      </div>

    );
  }
  
export default AddDescriptions;