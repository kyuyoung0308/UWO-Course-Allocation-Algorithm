require('dotenv').config()

///Both the front-end and the back-end must use a single network endpoint
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const { admin, firestore, auth } = require("./firebase")
const multer = require('multer');
var upload = multer();
const fs = require('fs');
//const Downloader = require('nodejs-file-downloader');

const { parse } = require ('json2csv');
const { fstat } = require('fs');
let bucketName = 'gs://ta-course-matching-app.appspot.com';

const app = express();
const coursesRef = firestore.collection('courses')


app.use(cors());

app.use(express.static(path.join(__dirname, '/client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

//ROUTES
function findColumn(json, name) {
    for (let i in json[0]) {
        if (json[0][i] === name) {
            return i;
        }
    }
    return undefined;
}

function findTAHours(csv, course) {
    for(let i of csv) {
        if(i[0] === course) {
            return parseInt(i[1], 10);
        }
    }
    return 0;
}

const csv2json = (str) => {
    let results = [];
    results = str.split(/\r\n|\n|\r/);
    for(let i in results) {
        results[i] = results[i].replace(/['"]+/g, '');
        results[i] = results[i].split(",");
    }
    return results;
};

app.post('/api/admin/matchTA', (req, res) => {
    const { applicantJSON, coursesJSON } = req.body;
    let csv = fs.readFileSync('./information/hours.csv', 'utf8');
    csv = csv2json(csv);

    //COLUMN LOCATIONS
    let courseLocation = [findColumn(applicantJSON, 'Course Code'), findColumn(coursesJSON, 'Course Code')];
    let emailLocation = findColumn(applicantJSON, 'applicant email');
    let professorLocation = findColumn(applicantJSON, 'Professor Rank');
    let courseRankLocation = findColumn(applicantJSON, 'Course Rank');
    let courseHoursLocation = findColumn(applicantJSON, '5or10 hrs');
    let prioritizationLocation = findColumn(applicantJSON, 'Applicant status ( 1- Fundable, 2-NotFundable,3-External)');
    let nameLocation = findColumn(applicantJSON, 'Applicant Name');

    // INPUT VALIDATION
    let acceptedIndividuals = [];
    if (courseLocation[0] === undefined || courseLocation[1] === undefined) {
        //excel file does not specify course codes and therefore we cannot process it
        return res.end();
    }
    for (let i of applicantJSON) {
        for (let j of coursesJSON) {
            if (j[courseLocation[1]] === i[courseLocation[0]]) {
                acceptedIndividuals.push(i);
                break;
            }
        }
    }
    //first row is headers
    acceptedIndividuals.shift();

    let userArray = [];
    //SCHEMA: [Course Code, Applicant Name, Applicant Email, prioritization, ApplicantScore, ProfScore, ProfRankScore, Hours, qualificationFactor]
    for (let i in acceptedIndividuals) {
        userArray.push([acceptedIndividuals[i][courseLocation[0]], acceptedIndividuals[i][nameLocation], acceptedIndividuals[i][emailLocation], acceptedIndividuals[i][prioritizationLocation], undefined, undefined, undefined, acceptedIndividuals[i][courseHoursLocation]]);
    }

    //CALCULATE SCORES
    //STD-13
    let applicantScoreMap = new Map();
    for(let i in acceptedIndividuals) {
        let mapResult = applicantScoreMap.get(acceptedIndividuals[i][emailLocation]);
        if(mapResult === undefined) {
            applicantScoreMap.set(acceptedIndividuals[i][emailLocation], 1);
        }
        else {
            applicantScoreMap.set(acceptedIndividuals[i][emailLocation], mapResult + 1);
        }
    }
    for(let i in acceptedIndividuals) {
        let ranking = acceptedIndividuals[i][courseRankLocation];
        let max = applicantScoreMap.get(acceptedIndividuals[i][emailLocation]);
        userArray[i][4] = Math.round(((max - (ranking - 1))/max) * 100) / 100;
    }

    //STD-14
    let professorScoreMap = new Map();
    for(let i in acceptedIndividuals) {
        let mapResult = professorScoreMap.get(acceptedIndividuals[i][courseLocation]);
        if(mapResult === undefined) {
            professorScoreMap.set(acceptedIndividuals[i][courseLocation], 1);
        }
        else {
            professorScoreMap.set(acceptedIndividuals[i][courseLocation], mapResult + 1);
        }
    }
    for(let i in acceptedIndividuals) {
        let ranking = acceptedIndividuals[i][professorLocation]; //grab prof applicant ranking
        let max = applicantScoreMap.get(acceptedIndividuals[i][courseLocation]);
        userArray[i][4] = Math.round(((max - (ranking - 1))/max) * 100) / 100;
    }

    //RANKING ALGORITHM
    for(let i of userArray) {
        //FORMULA: ApplicantScore*0.7 + ProfScore*0.3;
        i[8] = i[4]*0.7 + i[5]*0.3;
    }

    //STD-15
    //Sorts all applications by status and qualificationFactor (status takes priority)
    userArray = userArray.sort((a, b) => {
        let n = a[3] - b[3];
        if (n !== 0) {
            return n;
        }
        return b[8] - a[8];
    })

    //Holds objects including courseCode, hours needed, and TAs array
    let courses = []
    //CREATING COURSES OBJECTS IN COURSES ARRAY
    for (i = 1; i < coursesJSON.length; i++) {
        let course = {
            courseCode: coursesJSON[i][0],
            hoursToFill: findTAHours(csv, coursesJSON[i][0]),
            hoursFilled: 0,
            TAs: []
        }
        courses.push(course);
    }

    // //adding TAs to courses based off of previous sort
    while(userArray.length > 0) {
        for(let ta of userArray) {
            let requestedCourse = ta[0];
            let coursePosition;

            for (i = 0; i < courses.length; i++) {
                if (requestedCourse == courses[i].courseCode) {
                    coursePosition = i;
                    break;
                }
            }

            if ((courses[coursePosition].hoursToFill - (courses[coursePosition].hoursFilled + ta[7])) >= 0) {
                courses[coursePosition].hoursFilled = courses[coursePosition].hoursFilled + ta[7];
                courses[coursePosition].TAs.push([ta[2], ta[7]])
                userArray = userArray.filter(user => user[2] !== ta[2]);
                break;
            }
            else {
                continue;
            }
        }
    }

    res.send(courses);

    //Turn Courses into parsable csv
    let results = [["Course Code", "Hours to Fill", "TAs (TA then Hour)"]];
    for(let course of courses) {
        let temp = [course.courseCode, course.hoursToFill];
        for(let TAs of course.TAs) {
            temp.push(TAs[0]);
            temp.push(TAs[1]);
        }
        results.push(temp);
    }

    const csv2 = parse(results);
    fs.writeFileSync('./information/results.csv',csv2,'binary');
})

app.get('/api/admin/downloadResults', (req, res) => {
    res.download(path.join(__dirname, '/information/results.csv'));
})

app.post('/api/admin/uploadResults', (req, res) => {
    const {resultsJSON} = req.body;
    const csv = parse(resultsJSON);
    fs.writeFileSync('./information/results.csv',csv,'binary');
    res.end();
})

app.post('/api/admin/createUser', (req, res) => {
    let { email, password } = req.body;
    admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        disabled: false,
      })
      .then((userRecord) => {
        console.log('Successfully created new user:', userRecord.uid);
        return res.send("Account successfully created!");
      })
      .catch((error) => {
        console.log('Error creating new user:', error);
        return res.send("Server error encountered.");
      });
})

//upload spreadsheet of applicants
app.post('/api/admin/sendApplicants', async (req,res)=>{
    const {applicantJSON} = req.body;

    //keep this because we need this
    const csv = parse(applicantJSON);
    fs.writeFileSync('./information/data.csv',csv,'binary');

    //see what index q1 starts at Q1
    let question = applicantJSON[0].indexOf('Q1')
    for(let i in applicantJSON) {
        applicantJSON[i] = applicantJSON[i].slice(0, question);
    }
    applicantJSON[0].push('Professor Rank');
    const csv2 = parse(applicantJSON);
    fs.writeFileSync('./information/rankings.csv',csv2,'binary');

    res.end();
})

//update applicant spreadsheet with prof rankings 
app.post('/api/professor/sendRankings', async (req, res) => {
    const {applicantJSON} = req.body;

    const csv = parse(applicantJSON);
    fs.writeFileSync('./information/rankings.csv',csv,'binary');

    res.end();
});

// //downloads the file containing all the information of the applicants
app.get('/api/professor/getInfo',(req, res) => {
    res.download(path.join(__dirname, '/information/data.csv')); 
});

app.get('/api/professor/getRankings',(req, res) => {
    res.download(path.join(__dirname, '/information/rankings.csv')); 
});

app.post('/api/admin/addCourse', (req, res) => {
    let {courseCode, professor}  = req.body;
    coursesRef.doc(courseCode).set(
        {courseCode: courseCode, professor: professor, description: "", questions:""},
        {merge: true})
    res.end();
})

app.post('/api/professor/addDescription', async (req,res) =>{
    let { professor, courseCode, description, questions } = req.body; //questions = []

    const courseRef = coursesRef.doc(courseCode);

    const doc = await courseRef.get();

    console.log(doc.data().professor);


    if(doc.data().professor == professor){
        if(courseRef != null){ 
            courseRef.set({questions: questions, description: description}, {merge:true})
        } else { 
            console.log("course does not exist");
        }
       
    } else {
        console.log("Professor does not exist");
    
    }
    res.end();
})

//get course data from database
app.get('/api/admin/getCourseData', async (req, res) => {

    let data = [];
    //get all docs in collection
    const snapshot = await coursesRef.get();
    if (snapshot.empty) {
        console.log('No matching documents.');
        res.end();
    }
    snapshot.forEach(doc => {
        data.push(doc.data()); //store data in array
    });
    res.send(data); //send array of course data
})

//downloads the file containing information of the applicants with professor ranking
app.get('/api/admin/getProfRanking',(req, res) => {
    res.download(path.join(__dirname, '/information/rankings.csv')); 
});

app.post('/api/admin/setTAHours',(req, res) => {
    const {hoursJSON} = req.body;

    let courseLocation = findColumn(hoursJSON, 'Course Code');
    let hoursLocation = findColumn(hoursJSON, 'Previous TA hours');
    let lastLocation = findColumn(hoursJSON, 'Previous Enrollments');
    let currentLocation = findColumn(hoursJSON, 'Current Enrollemnts');

    //No. Of TA hours = (No. of Hours laster year / No. of enrollments last year) * current enrollment
    let results = [['Course Code', 'TA Hours']];
    for(let i = 1; i < hoursJSON.length; i++) {
        let temp = (hoursJSON[i][hoursLocation] / hoursJSON[i][lastLocation]) * hoursJSON[i][currentLocation];
        results.push([hoursJSON[i][courseLocation], temp]);
    }

    const csv = parse(results);
    fs.writeFileSync('./information/hours.csv',csv,'binary');

    res.end();
});

app.post('/api/admin/updateTAHours',(req, res) => {
    const {hoursJSON} = req.body;

    const csv = parse(hoursJSON);
    fs.writeFileSync('./information/hours.csv',csv,'binary');

    res.end();
});

app.get('/api/admin/getTaHours', (req, res) => {
    res.download(path.join(__dirname, '/information/hours.csv'));
})

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});


app.listen(5000);