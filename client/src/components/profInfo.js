import { useState } from "react";
import axios from "axios";
import ProfNav from "./profNav";
import readXlsxFile from "read-excel-file";
import fileDownload from "js-file-download";

function ProfInfo() {
  const [file, setFile] = useState();

  async function handleSubmit() {
    let xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    let xls = "application/vnd.ms-excel";
    let csv = ".csv";
    
    if (file === undefined) {
      alert("Please enter a file.");
      return;
    }

    if (file.name.split('.').pop() === 'csv') {
      // file.type = '.csv';
    }

    console.log(file.type, file);

    //upload file
    if (file.type === xlsx || file.type === xls) {
      try {
        let applicantJSON = await readXlsxFile(file);
        postApplicantFile(applicantJSON);
      } catch (error) {
        // CSV file
        const reader = new FileReader();
        reader.onload = () => {
            console.log(reader.result);
            const applicantJSON = reader.result
              .split('\n')
              .map(line => line.split(',').map(entry => entry.replace(/^"|"$/g, '')));
            postApplicantFile(applicantJSON);
        };
        reader.readAsText(file);
      }
    }
    else {
      alert("Files must either be csv, xls, or xlsx file format.");
    }
  }

  function postApplicantFile (applicantJSON) {
    console.log({applicantJSON});
    const data = {
      applicantJSON: applicantJSON
    };

    //extract data
    axios.post('/api/professor/sendRankings', data) //send data to backend
      .then((res) => {
        alert("Done");
      })
      .catch((err) => {
        alert("Failure. :(")
      })
  }

  async function handleDownload() {
    axios.get('/api/professor/getInfo')
    .then((res) => {
      fileDownload(res.data, 'data.csv');
  })
  .catch((err) => {
      console.log(err);
  });
  }

  async function handleDownload2() {
    axios.get('/api/professor/getRankings')
    .then((res) => {
      fileDownload(res.data, 'rankings.csv');
  })
  .catch((err) => {
      console.log(err);
  });
  }

  //Rank TA front end for uploading rankings
  return (
    <div>
      <ProfNav />
      <div className="center matchTA">
        <div className="box">
          <p className="title"><strong>Upload Professor Rankings</strong></p>
          <label>File</label>
          <input onChange={(event) => setFile(event.target.files[0])} type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
          <button onClick={() => handleSubmit()}>Upload</button>
          <p className="title"><strong>Download Applicant Info</strong></p>
          <button onClick={() => handleDownload()}>Download</button>
          <p className="title"><strong>Download Professor Rankings</strong></p>
          <button onClick={() => handleDownload2()}>Download</button>
        </div>
      </div>
    </div>
  );
}

export default ProfInfo;