import { useRef } from "react";
import axios from "axios";
import AdminNav from "./adminNav";

function AddCourses() {
  const courseRef = useRef();
  const emailRef = useRef();

  function handleSubmit(courseCode, professor) {
    //alert(course + email);
    axios.post('/api/admin/addCourse', {courseCode, professor})
    .then((res) => {
      alert("DONE")
    })
    .catch((err) => {
      alert(err);
    })
  }

  function handleSubmit2() {
    axios.get('/api/admin/getCourseData')
    .then((res) => {
      console.log(res.data);
      alert("DONE");
      
      var courseData = res.data; //array of JSON object
      var csvRows = [];

      //get headers
      const headers = Object.keys(courseData[0]);
      csvRows.push(headers.join(';'));
      console.log(csvRows);

      //loop over rows
      for (const row of courseData){
        const values = headers.map(header => {
          const fieldValue = row[header];
          console.log("item  " + fieldValue)
          return row[header];
        })
        csvRows.push(values.join(';'));
      }
      var csvData = csvRows.join('\n');
      console.log(csvData);

      //download as csv
      const blob = new Blob(["SEP=;\n" + csvData], { type: 'text/csv'});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden','');
      a.setAttribute('href', url);
      a.setAttribute('download', 'coursesInformation.csv');
      a.click();

    })
    .catch((err) => {
      alert(err);
    })
  }

  return (
    <div>
      <AdminNav />
      <div className="center matchTA">
          <div className="box">
            <p className="title"><strong>Add Course</strong></p>
            <label>Course</label>
            <input type="text" ref={courseRef} />
            <br />
            <label>Professor Email</label>
            <input type="text" ref={emailRef} />
            <button onClick={() => handleSubmit(courseRef.current.value, emailRef.current.value)}>Create</button>
            <hr />
            <p className="title"><strong>Download Courses Spreadsheet</strong></p>
            <button onClick={() => handleSubmit2()}>Download</button>
          </div>
        </div>
    </div>
  );
}

export default AddCourses;