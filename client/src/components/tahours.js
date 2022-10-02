import { useState } from "react";
import axios from "axios";
import AdminNav from "./adminNav";
import readXlsxFile from "read-excel-file";
import fileDownload from "js-file-download";

function TAHours() {
  const [file, setFile] = useState();

  async function handleSubmit() {
    let xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    let xls = "application/vnd.ms-excel";
    let csv = ".csv";

    if (file === undefined) {
      alert("Please enter a file.");
      return;
    }
    if (file.type === xlsx || file.type === xls || file === csv) {
      let hoursJSON = await readXlsxFile(file);
      let data = {
        hoursJSON: hoursJSON
      };
      axios.post('/api/admin/setTAHours', data)
        .then((res) => {
          alert("working");
        })
        .catch((err) => {
          alert("Failure. :(")
        });
    }
    else {
      alert("Files must either be csv, xls, or xlsx file format.");
    }
  }

  async function handleDownload() {
    axios.get('/api/admin/getTaHours')
    .then((res) => {
        fileDownload(res.data, 'hours.csv');
    })
    .catch((err) => {
        console.log(err);
    });
  }

  async function handleUpdate() {
    let xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    let xls = "application/vnd.ms-excel";
    let csv = ".csv";

    if (file === undefined) {
      alert("Please enter a file.");
      return;
    }
    if (file.type === xlsx || file.type === xls || file === csv) {
      let hoursJSON = await readXlsxFile(file);
      let data = {
        hoursJSON: hoursJSON
      };
      axios.post('/api/admin/updateTAHours', data)
        .then((res) => {
          alert("working");
        })
        .catch((err) => {
          alert("Failure. :(")
        });
    }
    else {
      alert("Files must either be csv, xls, or xlsx file format.");
    }
  }

  return (
    <div>
      <AdminNav />
      <div className="center matchTA">
        <div className="box">
          <p className="title"><strong>Upload TA HOURS Info</strong></p>
          <label>File</label>
          <input onChange={(event) => setFile(event.target.files[0])} type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
          <button onClick={() => handleSubmit()}>Upload</button>
          <p className="title"><strong>Download Info</strong></p>
          <button onClick={() => handleDownload()}>Download</button>
          <p className="title"><strong>Update TA HOURS Info</strong></p>
          <label>File</label>
          <input onChange={(event) => setFile(event.target.files[0])} type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
          <button onClick={() => handleUpdate()}>Update</button>
        </div>
      </div>
    </div>
  );
}

export default TAHours;