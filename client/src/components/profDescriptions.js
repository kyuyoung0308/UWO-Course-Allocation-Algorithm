import ProfNav from "./profNav";
import { useRef, useState } from "react";
import firebase from "../firebase.js";
import '@firebase/auth';
import axios from "axios";

function AddCourses() {
  const courseRef = useRef();
  const descriptionRef = useRef();
  const [questionList, setQuestionList] = useState([""]);

  function handleSubmit(courseCode, description, questions) {
    //get firebase uid email
    let professor = firebase.auth().currentUser.email;
    axios.post('/api/professor/addDescription', {courseCode, description, questions, professor})
    .then((res) => {
      alert("DONE")
    })
    .catch((err) => {
      alert(err);
    })
  }

  // handle input change
  const handleInputChange = (e, index) => {
    const { value } = e.target;
    const list = [...questionList];
    list[index] = value;
    setQuestionList(list);
  };

  // handle click event of the Remove button
  const handleRemoveClick = index => {
    const list = [...questionList];
    list.splice(index, 1);
    setQuestionList(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setQuestionList([...questionList, ""]);
  };

  return (
    <div>
      <ProfNav />
      <div className="center matchTA">
          <div className="box">
            <p className="title"><strong>Add Descriptions</strong></p>
            <label>Course</label>
            <input type="text" ref={courseRef} />
            <br />
            <label>Description</label>
            <input type="text" ref={descriptionRef} />
            <br />
            <label>Questions</label>
            {questionList.map((x, i) => {
              return (
                <div className="flex-row">
                  <input className="mr-10" value={x.firstName} onChange={e => handleInputChange(e, i)} />
                  <div>
                    {questionList.length !== 1 && <button className="mr-10" onClick={() => handleRemoveClick(i)}>Remove</button>}
                    {questionList.length - 1 === i && <button onClick={handleAddClick}>Add</button>}
                  </div>
                </div>
              );
            })}
            <button onClick={() => handleSubmit(courseRef.current.value, descriptionRef.current.value, questionList)}>Submit</button>
          </div>
        </div>
    </div>
  );
}

export default AddCourses;