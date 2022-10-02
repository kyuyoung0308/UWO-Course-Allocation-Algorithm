import "../styles/style.css";
import AdminNav from "./adminNav";
import { useState } from "react";
import readXlsxFile from "read-excel-file";
import fileDownload from "js-file-download";
import axios from "axios";

function MatchingTA() {

    const [taList, setTAList] = useState(undefined);
    const [applicantList, setApplicantList] = useState(undefined);
    const [resultsList, setResultsList] = useState(undefined);
    const [bool, setBool] = useState(true);
    const [data, setData] = useState([{}]);
    
    async function handleSubmit() {
        let xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        let xls = "application/vnd.ms-excel";
        let csv = ".csv";
        if(taList === undefined || applicantList === undefined) {
            alert("Please enter a file.");
            return;
        }
        if((taList.type === xlsx || taList.type === xls || taList === csv) && (applicantList.type === xlsx || applicantList.type === xls || applicantList === csv)) {
            let applicantJSON = await readXlsxFile(applicantList);
            let coursesJSON = await readXlsxFile(taList);
            let data = {
                applicantJSON: applicantJSON,
                coursesJSON: coursesJSON
            };
            axios.post('/api/admin/matchTA', data)
                .then((res) => {
                    let result = res.data;
                    setData(result);
                    setBool(false);
                })
                .catch((err) => {
                    alert("Failure. :(");
                    console.log(err);
                });
        }
        else {
            alert("Files must either be csv, xls, or xlsx file format.");
        }
    }

    function handleChange(number, file) {
        if(number === 1) {
            setTAList(file);
        }
        else if(number === 2){
            setApplicantList(file);
        }
        else {
            setResultsList(file);
        }
    }

    function handleDownload() {
        axios.get('/api/admin/downloadResults')
        .then((res) => {
            fileDownload(res.data, 'results.csv');
        })
        .catch((err) => {
            console.log(err);
        });
    }

    async function handleUpload() {
        let xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if(resultsList === undefined) {
            alert("Please enter a file.");
            return;
        }
        if(resultsList.type === xlsx) {
            let resultsJSON = await readXlsxFile(resultsList);
            let data = {
                resultsJSON: resultsJSON
            };
            axios.post('/api/admin/uploadResults', data)
                .then((res) => {
                    alert("DONE");
                })
                .catch((err) => {
                    alert("Failure. :(");
                });
        }
        else {
            alert("Files must either xlsx file format.");
        }
    }

    return (
        <div>
            <AdminNav />
            {
                bool ? 
                    <div className="matchTA">
                        <div className="box">
                            <p className="title"><strong>Matching TA Page</strong></p>
                            <div className="upload">
                                <label htmlFor="courseList">Upload the Course List:</label>
                                <input onChange={(event) => handleChange(1, event.target.files[0])} id="courseList" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            </div>
                            <div className="upload">
                                <label htmlFor="applicantList">Upload the Applicant List:</label>
                                <input onChange={(event) => handleChange(2, event.target.files[0])} id="applicantList" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            </div>
                            <div>
                                <button onClick={() => handleSubmit()}>Submit</button> 
                            </div>
                            <p className="title"><strong>Results</strong></p>
                            <button onClick={() => handleDownload()}>Download</button> 
                            <br />
                            <div className="upload">
                                <label htmlFor="applicantList">Upload the Updated Results:</label>
                                <input onChange={(event) => handleChange(3, event.target.files[0])} type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            </div>
                            <button onClick={() => handleUpload()}>Upload Changes</button> 
                        </div>
                    </div>
                :
                    <div className="center matchTA">
                        <div className="box">
                        <p className="title"><strong>Matching TA Results</strong></p>
                        {
                            data.map((item, index) => (
                                <div className="result">
                                    <p>Course Code: {item.courseCode}</p>
                                    <p>Hours To Fill: {item.hoursToFill}</p>
                                    <p>TA's: </p>
                                    {
                                        item.TAs.map((ta) => (
                                            <p className="pl-50">{ta[0]} HOURS: {ta[1]}</p>
                                        ))
                                    }
                                </div>
                            ))
                        }
                        </div>
                    </div>
            }
        </div>
    );
  }
  
export default MatchingTA;