import { useRef } from "react";
import axios from "axios";
import AdminNav from "./adminNav";

function Register() {
  const userRef = useRef();
  const passRef = useRef();

    function handleSubmit(email, password) {
      let data = {
        email: email,
        password: password
      };
      axios.post('/api/admin/createUser', data)
        .then((res) => {
            let result = JSON.stringify(res.data);
            alert(result);
        })
        .catch((err) => {
            alert("Failure. :(")
        });
    }

    return (
      <div>
        <AdminNav />
        <div className="center matchTA">
            <div className="box">
              <p className="title"><strong>Create New Professor</strong></p>
              <label>Username</label>
              <input type="text" ref={userRef} />
              <br />
              <label>Password</label>
              <input type="password" ref={passRef} />
              <button onClick={() => handleSubmit(userRef.current.value, passRef.current.value)}>Create</button>
            </div>
          </div>
      </div>
    );
  }
  
export default Register;