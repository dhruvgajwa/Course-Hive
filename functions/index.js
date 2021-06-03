const functions = require('firebase-functions');
const webPush = require('web-push');
const admin = require('firebase-admin');
var keys = require('./Vapidkeys');
const express = require('express');
const cors = require('cors');
const app = express();

webPush.setVapidDetails(
  'mailto:dhruvg.dakshana16@gmail.com',
  keys.vapidKeys.publicKey,
  keys.vapidKeys.privateKey
);


// ****************** content  data structure for reference**************************
// fId: string;
// courseName: string;
// courseId: string;
// documentType: string;
// documentAddress: string;
// fileType: string;
// uploadedByName: string;
// uploadedByFId: string;
// uploadedByRollNo: string;
// uploadedAt: number;
// upVotes: number;
// downVotes: number;
// upVotedBy: string[];
// downVotedBy: string[];







exports.helloWorld = functions.https.onRequest((request, response) => {
        response.send("Hello from Firebase!");
});



exports.somefunctionA = functions.firestore.document('Courses/{CourseID}/contents/{contentID}')
.onWrite((change, context) => {
    // If we set `/users/marie` to {name: "Marie"} then
    // context.params.userId == "marie"
    // ... and ...
    // change.after.data() == {name: "Marie"}

    // this data is the content object
    let content  = change.after.data();
    console.log(JSON.stringify(content));
    const courseID = context.params.CourseID;
    console.log(courseID);
    // get the course name da!


    const getSomethingPromise = admin.database().ref(`/PinnedCoursesList/${courseID}/studentsPinnedThisCourse`).once('value'); // this is a list of students
    getSomethingPromise.then( result => {
      const listOfStudents = result.val();
      console.log(result);
      console.log(listOfStudents);
      console.log(typeof(listOfStudents));
      console.log(Object.values(listOfStudents));

      Object.values(listOfStudents).forEach( studentOb => {
        // 
        console.log(studentOb);
        const studentEndpointURL = admin.database().ref(`/PushObject/${studentOb['studentFID']}`).once('value'); //This will return the pushSubscription object of peroson
        studentEndpointURL.then( response => {
          // This response may have 4 possible options
          // chrome, Mfirefox, Dchrome, Dfirefox
          console.log(response.val());
          // This code will send notifications to all sections, But, Should run for certain sections only
          if(response !== undefined && typeof(response === 'object')) {
            console.log(typeof(response.val()))
            let allEnpoints =   Object.values(response.val()); // This is an array

            allEnpoints.forEach( endpoint => {
              var data = endpoint;
              console.log(data);
                var pushSubscription = JSON.parse(data);
                if(content['courseId'] === undefined || content['courseId'] === null) {
                  content['courseId'] = 'ED5080';
                }
                if(content['courseName'] === undefined || content['courseName'] === null) {
                  content['courseName'] = 'Some Random Cours Name';
                }
                if(content['uploadedByName'] === undefined || content['uploadedByName'] === null) {
                  content['uploadedByName'] = 'Some Random Name';
                }
                if(content['documentType'] === undefined || content['documentType'] === null) {
                  content['documentType'] = 'Some Random Documenr';
                }
                const notificationPayload = {
                  "notification": {
                      "title": `Resource Added in ${content['courseId']} | ${content['courseName']}`,
                      "body": `A new resourse has been added in this course by ${content['uploadedByName']} labeled as ${content['documentType']}`,
                      "icon": "https://coursehive.in/assets/favicon.ico",
                      "vibrate": [100, 50, 100],
                      "data": {
                          "dateOfArrival": Date.now(),
                          "primaryKey": 1,
                          "click": `https://coursehive.in/course/${content['courseId']}#${content['fId']}`
                      },
                      "actions": [{
                          "action": "click",
                          "title": "go to the content directly"
                      }]
                  }
                }
          
          
                try{    webPush.sendNotification(
                          pushSubscription,
                          JSON.stringify(notificationPayload)
                        ).then(res => {
                            console.log(res);
                            return true;
                        }).catch( e => {
                            console.log(e)
                        });
                  
                      
                  } catch(e) {
                      console.log(e);
                  }
            });
          }


    
            return true;
      }).catch( error => {
        console.log( '2', error)
      });
    });

    return true;
  }).catch( error => {
    console.log( '1', error)
  });
    

    // get the coutrse name,
    // get the


});

admin.initializeApp(functions.config().firebase);
// exports.widgets = functions.https.onRequest(app);
// In a



