import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router} from '@angular/router';
import { Course, Review, FAQ, Answer, Content } from 'src/app/Models/Course';
import { FirebaseService} from '../../services/firebase.service';
import { AuthService} from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { tap } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { auth } from 'firebase';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { MyNotifications, Profile, MyPinnedCourses, StudentsInPinnedCourse } from 'src/app/Models/Profile';
import {DataSharingService} from '../../services/DataService/data-sharing.service';

// So, there is no auth gaurd on this page, So, has to call the data
@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
  courseId: string = '';
  myFId: string = '';
  OpenedQuestion: FAQ = new FAQ();
  uploadContent: Content;
  AnswerToOpenQuestion: Answer = new Answer();
  auth: firebase.User  ;
  isImageUploaded = false;
  Que: string = '';
  IfOtherDocType: string = '';
  review:string = '';
  isEmailVerified = false;
  profile:Profile = new Profile();
  DocumentTypeOptions: string[] = [ 'Quiz 1', 'Quiz 2', 'Midsem', 'Endsem', ' Assignments', 'Surprise Quiz', 'Project', 'Other'];
  course: Course = new Course();
  


    // Upload Wala Part
 task: AngularFireUploadTask;
 percentage: Observable<number>;
 snapshot: Observable<any>;
 downloadURL: Observable<string>;
 isHovering: boolean;
  constructor( private activatedRoutes: ActivatedRoute,
               private firebaseService: FirebaseService,
               private authService: AuthService,
               private modalService: NgbModal,
               private storage: AngularFireStorage,
               private router: Router,
               private afs: AngularFirestore,
               private dataSharingService: DataSharingService) { }

  ngOnInit() {
    this.myFId = this.authService.getMyFId();
    console.log(this.myFId);
    this.activatedRoutes.params.subscribe( (params: Params) => {
      console.log(params);
    
      this.courseId = params.id;
      console.log(params.id);
      
      this.firebaseService.getCourseDetailsById(this.courseId).subscribe((data: Course) => {
        if (data === undefined) {
          // Course is not Available in database
          alert(' Course is not Available in database .. email@ dhruvgajwa008@gmail.com to add the course!');
          this.router.navigate(['home'] );
        }
        this.course = data;
        console.log(this.course);
      });

      this.firebaseService.getCourseReviewsById(this.courseId).subscribe((data: Review[]) => {
        this.course.reviews = data;
        console.log(this.course);
      });

      this.firebaseService.getCourseFAQsById(this.courseId).subscribe((data: FAQ[]) => {
        this.course.fAQs = data;
        this.course.fAQs.forEach((que: FAQ) => {
          que.answers = undefined;
        });
        console.log(this.course);
      });

      this.firebaseService.getCourseContentById(this.courseId).subscribe( (data: Content[]) => {
        this.course.contents = data;
        // to scroll to that specific course!
       

        setTimeout(() => {
          let arrFromLinks = window.location.href.split('#');
          if(arrFromLinks.length > 1) {
            document.getElementById(arrFromLinks[arrFromLinks.length - 1]).scrollIntoView();
            document.getElementById(arrFromLinks[arrFromLinks.length - 1]).classList.add('HighlightedContent');
          }
          console.log(arrFromLinks)
        }, 1000);

        console.log(data);
      });

    });
    this.authService.getAuth().subscribe( (au: firebase.User) => {
      if (au) {
        this.auth = au;
        console.log(this.auth);
        this.isEmailVerified = au.emailVerified;

        console.log('data sharing service iss',this.dataSharingService.getProfileData());
        if(this.dataSharingService.getProfileData() !== undefined) {
          this.profile = this.dataSharingService.getProfileData();
          if(this.profile.myPinnedCourses.length > 0) {
            for (let index = 0; index < this.profile.myPinnedCourses.length; index++) {
              const element = this.profile.myPinnedCourses[index];
              
              if(this.courseId === element.id){
                document.getElementById('coursePinButton').innerText = `Unpin`;
                break;
              } else {
                document.getElementById('coursePinButton').innerText = `Pin`;
              }
              
            }
          } else {
            document.getElementById('coursePinButton').innerText = `Pin`;
          }
        } else {
          this.firebaseService.getMyProfileData(this.auth.uid).subscribe ( res => {
            this.profile = res;
            console.log('res ponse reci', res);
            this.dataSharingService.setProfileData(res);
            // now set the profile dependent tags
            if(this.profile.myPinnedCourses.length > 0) {
              for (let index = 0; index < this.profile.myPinnedCourses.length; index++) {
                const element = this.profile.myPinnedCourses[index];
                
                if(this.courseId === element.id){
                  document.getElementById('coursePinButton').innerText = `Unpin`;
                  break;
                } else {
                  document.getElementById('coursePinButton').innerText = `Pin`;
                }
                
              }
            } else {
              document.getElementById('coursePinButton').innerText = `Pin`;
            }

           

          })
        }
      }

    });

  }

  getDate(n: number) {
    let s: string = new Date(n).toDateString();
    return s.slice(4,10);
  }



  // For Reviews
  IUpvoted(upvotedBy: string[]) {
    if (upvotedBy.includes(this.myFId)) {
      return true;
    } else {
      return false;
    }
  }
  IDownVoted(downVotedBy: string[]) {
    if (downVotedBy.includes(this.myFId)) {
      return true;
    } else {
      return false;
    }
  }


  UpVoteClicked(review: Review) {
    if (!this.isEmailVerified) {
      alert('Email not verified! Verify to perform this task');
      return;
    }
    if (this.IUpvoted(review.upVotedBy)) {
      //  let index = this.course.reviews.indexOf(review);
      //  let i2 = this.course.reviews[index].upVotedBy.indexOf(this.myFId);
      //  if (i2 > -1) {
      //   this.course.reviews[index].upVotedBy.splice(index, 1);
      //  }

      review.upVotedBy.splice(review.upVotedBy.indexOf(this.myFId), 1);
    // Reverse Upvote
       this.firebaseService.reverseUpVote(this.courseId, review.fId, this.myFId, review.fromFid);

    } else if (this.IDownVoted(review.downVotedBy) ) {
            // Upvote and Reverse DownVote
            // let index = this.course.reviews.indexOf(review);
            // let i2 = this.course.reviews[index].downVotedBy.indexOf(this.myFId);
            // if (i2 > -1) {
            //  this.course.reviews[index].downVotedBy.splice(index, 1);
            // }
      review.upVotedBy.push(this.myFId);
      review.downVotedBy.splice(review.downVotedBy.indexOf(this.myFId), 1);

      this.firebaseService.upvoteAndReverseDownvote(this.courseId, review.fId, this.myFId, review.fromFid);
    } else {
      // Just UpVote
      review.upVotedBy.push(this.myFId);
      this.firebaseService.upvote(this.courseId, review.fId, this.myFId, review.fromFid);
    }
  }

      DownVoteClicked(review: Review) {
        if (!this.isEmailVerified) {
          alert('Email not verified! Verify to perform this task');
          return;
        }
        if (this.IDownVoted(review.downVotedBy)) {
          review.downVotedBy.splice(review.downVotedBy.indexOf(this.myFId), 1);
          this.firebaseService.reverseDownVote(this.courseId, review.fId, this.myFId, review.fromFid);
          // Reverse Downvote
    } else if (this.IUpvoted(review.upVotedBy) ) {
      review.upVotedBy.splice(review.upVotedBy.indexOf(this.myFId), 1);
      review.downVotedBy.push(this.myFId);
      this.firebaseService.downvoteAndReverseUpvote(this.courseId, review.fId, this.myFId, review.fromFid);
          // DownVote and Reverse UpVote
    } else {
      review.downVotedBy.push(this.myFId);
      this.firebaseService.downvote(this.courseId, review.fId, this.myFId, review.fromFid);
    // Just downVote
    }
    }


    ReadAnswer(question: FAQ) {
      
      this.firebaseService.getAnswerByQuestionFId(this.courseId, question.fId).
      subscribe((data: Answer[]) => {

        if (data === undefined ) {
          const d: Answer[] = [];
          this.course.fAQs[this.course.fAQs.indexOf(question)].answers = d;
          console.log(data);
          console.log(this.course);

        } else {
          this.course.fAQs[this.course.fAQs.indexOf(question)].answers = data;
          console.log(data);
          console.log(this.course);
        }
       
      });
    }


    AskAQuestionClicked() {
      if (!this.isEmailVerified) {
        alert('Email not verified! Verify to perform this task');
        return;
      }
      if (this.Que.length > 10 ) {
        console.log('Asking Question' + this.Que);

        this.authService.getAuth().subscribe( (auth) => {
          if (auth) {
            const at = new Date().getTime();
            let question = new FAQ();
            question.question = this.Que;
            question.askedByName =    auth.displayName;
            question.askedByRollNo = auth.email.slice(0, 8);
            question.at = at;
            console.log(question);

            this.firebaseService.AskAQuestion(this.Que,
              auth.displayName, auth.email.slice(0, 8), this.courseId ).then( _ => {
                this.Que = '';
                this.course.fAQs.unshift(question);
              });
          }
        })
        
      } else {
        alert(' ah.... the question is too small!');
        return;
      }
    }



    AnswerCLicked(content: any, question: FAQ) {
      if (!this.isEmailVerified) {
        alert('Email not verified! Verify to perform this task');
        return;
      }
      this.modalService.open(content, { size: 'lg' });
      this.OpenedQuestion = question;

    }


    AnswerSubmit() {
      if (!this.isEmailVerified) {
        alert('Email not verified! Verify to perform this task');
        return;
      }
      if (this.AnswerToOpenQuestion.answer.length > 10) {

      this.authService.getAuth().subscribe( (auth) => {
        this.AnswerToOpenQuestion.at = new Date().getTime();
        this.AnswerToOpenQuestion.fId = this.afs.createId();
        this.AnswerToOpenQuestion.fromName = auth.displayName;
        this.AnswerToOpenQuestion.fromRollNo = auth.email.slice(0, 8);
        this.AnswerToOpenQuestion.fromFid = this.myFId;
        console.log(this.AnswerToOpenQuestion);
        this.firebaseService.AnswerAQuestion(this.AnswerToOpenQuestion, this.OpenedQuestion.fId,
          this.courseId).then(_ => {
            this.course.fAQs.forEach((faq: FAQ) => {
              if (faq.fId === this.OpenedQuestion.fId) {
                faq.answers.unshift(this.AnswerToOpenQuestion);
              }
              this.AnswerToOpenQuestion = new Answer();
            });
            console.log(' Answered Question!');
          });
        this.modalService.dismissAll();
      });

    } else {
      alert('Answer too short!');
    }
    }


    DownloadClicked(link: string) {
      window.open(link, '_blank');
    }


    OpenUploadContentModal(content: any) {
      if (!this.isEmailVerified) {
        alert('Email not verified! Verify to perform this task');
        return;
      }
      this.uploadContent = new Content();
      this.uploadContent.courseId = this.course.id;
      this.uploadContent.courseName = this.course.name;
      this.uploadContent.uploadedByName = this.auth.displayName;
      this.uploadContent.uploadedByRollNo = this.auth.email.slice(0, 8);
      this.modalService.open(content, {size: 'lg'});

    }

    UploadContentClicked() {
      if (!this.isEmailVerified) {
        alert('Email not verified! Verify to perform this task');
        return;
      }

      if (this.uploadContent.documentType === '') {
        alert('Document Type not selected');
        return;
      }
      if (this.uploadContent.documentType === 'Other') {
        this.uploadContent.documentType = this.IfOtherDocType;
      }


      this.uploadContent.uploadedAt = new Date().getTime();
      this.uploadContent.uploadedByFId = this.myFId;
      console.log(this.uploadContent);

      if (this.isImageUploaded) {
        console.log('ImageUploaded');
        this.downloadURL.subscribe( (s: string) => {
          console.log(s);
          this.uploadContent.documentAddress = s;
          this.uploadContent.fId = this.afs.createId();
          this.firebaseService.UploadContent(this.uploadContent, this.courseId).then( _ => { 
            // content has been uploaded!
            // now send a async request to send notification to all the 
            // peopl who have upinned this course

            // first create a notification string .. aslo this code has not been tested yet!! so please check it.....
            let notification = new MyNotifications();
            notification.clickLink = window.location.href;
            notification.body = `A new resouorse has been added in your pinned  course ${this.courseId.toUpperCase()}: ${this.course.name}
             by ${this.auth.displayName} ... so go and check it out! hurray...!!`;
            notification.heading = `Resource update for ${this.courseId.toUpperCase()}: ${this.course.name}`;
            notification.receivedOn = new Date().getTime();

            // now send this notification to all pinned people
            this.firebaseService.getAllStudentPinnedThisCourse(this.courseId).subscribe( res => {
              // this response is an object
              let allList = Object.values(res);
              console.log(allList, res, typeof(res));
              allList.forEach(student => {
                this.firebaseService.addNotificationToStudent(student['studentFID'], notification);
              });
              
            })
            this.isImageUploaded = false;
            this.downloadURL = null;
            this.modalService.dismissAll();
            this.course.contents.unshift(this.uploadContent);

            // Adding to myUploads
            this.firebaseService.AddToMyUploads(this.uploadContent, this.myFId);
            });
        });
      } else {
        alert('File not uploaded');
        return;
      }

    }


    startUpload(event: FileList) {
      
      console.log('Started Uploadeing');
      // The File object
      const file = event.item(0);

      // The storage path
      const path = `test/${new Date().getTime()}_${file.name}`;

      // Totally optional metadata
      const customMetadata = { app: 'My AngularFire-powered PWA!' };

      // The main task
      this.task = this.storage.upload(path, file, { customMetadata });

      // Progress monitoring
      this.percentage = this.task.percentageChanges();
      this.task.snapshotChanges().pipe(
        // The file's download URL
            // The file's download URL
      finalize(() => {this.downloadURL =  this.storage.ref(path).getDownloadURL();
        this.isImageUploaded = true;} ),
      tap(snap => {
        console.log(snap);
        if (snap.bytesTransferred === snap.totalBytes) {


        }
        })
      ).subscribe();
    }


    ReviewThisCourse() {
      if (!this.isEmailVerified) {
        alert('Email not verified! Verify to perform this task');
        return;
      }
      let r = new Review();
      r.at = new Date().getTime();
      r.fromName = this.auth.displayName;
      r.courseId = this.courseId;
      r.fromRollNo = this.auth.email.slice(0, 8);
      r.review = this.review;
      r.fromFid = this.myFId;
      r.fId = this.afs.createId();
      this.firebaseService.ReviewCourse(this.courseId, r).then(_ => {
        this.course.reviews.unshift(r);
        this.review = '';
        this.firebaseService.AddToMyReviews(r, this.myFId) ;
      });
    }




    // For Course Content
    IUpvotedContent(upvotedBy: string[]) {
      if (upvotedBy.includes(this.myFId)) {
        return true;
      } else {
        return false;
      }
    }
    IDownVotedContent(downVotedBy: string[]) {
      if (downVotedBy.includes(this.myFId)) {
        return true;
      } else {
        return false;
      }
    }


    UpVoteClickedContent(content: Content) {
      if (!this.isEmailVerified) {
        alert('Email not verified! Verify to perform this task');
        return;
      }
      if (this.IUpvotedContent(content.upVotedBy)) {
        //  let index = this.course.reviews.indexOf(review);
        //  let i2 = this.course.reviews[index].upVotedBy.indexOf(this.myFId);
        //  if (i2 > -1) {
        //   this.course.reviews[index].upVotedBy.splice(index, 1);
        //  }

        content.upVotedBy.splice(content.upVotedBy.indexOf(this.myFId), 1);
        // Reverse Upvote
        this.firebaseService.reverseUpVoteContent(this.courseId, content.fId, this.myFId, content.uploadedByFId);

      } else if (this.IDownVotedContent(content.downVotedBy) ) {
              // Upvote and Reverse DownVote
              // let index = this.course.reviews.indexOf(review);
              // let i2 = this.course.reviews[index].downVotedBy.indexOf(this.myFId);
              // if (i2 > -1) {
              //  this.course.reviews[index].downVotedBy.splice(index, 1);
              // }
        content.upVotedBy.push(this.myFId);
        content.downVotedBy.splice(content.downVotedBy.indexOf(this.myFId), 1);
  
        this.firebaseService.upvoteAndReverseDownvoteContent(this.courseId, content.fId, this.myFId, content.uploadedByFId);
      } else {
        // Just UpVote
        content.upVotedBy.push(this.myFId);
        this.firebaseService.upvoteContent(this.courseId, content.fId, this.myFId,content.uploadedByFId);
      }
    }
  
        DownVoteClickedContent(content: Content) {
          if (!this.isEmailVerified) {
            alert('Email not verified! Verify to perform this task');
            return;
          }
          if (this.IDownVotedContent(content.downVotedBy)) {
            content.downVotedBy.splice(content.downVotedBy.indexOf(this.myFId), 1);
            this.firebaseService.reverseDownVoteContent(this.courseId, content.fId, this.myFId,content.uploadedByFId);
            // Reverse Downvote
      } else if (this.IUpvotedContent(content.upVotedBy) ) {
        content.upVotedBy.splice(content.upVotedBy.indexOf(this.myFId), 1);
        content.downVotedBy.push(this.myFId);
        this.firebaseService.downvoteAndReverseUpvoteContent(this.courseId, content.fId, this.myFId,content.uploadedByFId);
            // DownVote and Reverse UpVote
      } else {
        content.downVotedBy.push(this.myFId);
        this.firebaseService.downvoteContent(this.courseId, content.fId, this.myFId, content.uploadedByFId);
      // Just downVote
      }
      }



      getAnswerText(question: FAQ) {
        if (question.answers === undefined) {
          return 'Read answers';
        } else if (question.answers.length > 0) {
          return '';
        } else if (question.answers.length === 0) {
          return 'No answers!Please write one!';
        }
      }
      openProfile(fId: string ) {
        this.router.navigate(['profile/' + fId]);
      }


      DeleteContent(answer: Answer, question: FAQ) {
        this.firebaseService.deleteAnswer(answer, this.courseId, question.fId, answer.fId).then( _ => {
         let questionIndex = this.course.fAQs.indexOf(question);
         let ansewerIndex =  this.course.fAQs[questionIndex].answers.indexOf(answer);
          this.course.fAQs[questionIndex].answers.splice(ansewerIndex,1);
        });
      }
      getPinstatus(){
        if(this.profile.myPinnedCourses === undefined){
          return ``;
        }
        let listOfPinnedCourses = this.profile.myPinnedCourses;
        for (let index = 0; index < listOfPinnedCourses.length; index++) {
          const element = listOfPinnedCourses[index];
          if(this.courseId === element.id){
            return `Unpin`;
            break;
          } else {
            return `Pin`;
          }
          
        }
        
      }
      pinThisCourse(){
        let status =document.getElementById('coursePinButton').innerText;
        // pin this   
        console.log('pin clicked');
        if(status ===  `Pin`) {
          console.log('status is pinned!');
          // Pin this course and set the status as UnPine
          let pc = new MyPinnedCourses();
          pc.id = this.courseId;
          pc.name = this.course.name;
          pc.pinnedAtDate = new Date().toUTCString(); 

          let studentInPinnedCourse = new StudentsInPinnedCourse();
          studentInPinnedCourse.name = this.profile.name;
          studentInPinnedCourse.rollNo = this.profile.rollNo;
          studentInPinnedCourse.studentFID = this.profile.fId;
          studentInPinnedCourse.addedOn = new Date().getTime();


          this.firebaseService.savePinnedCourses(this.myFId,pc).then(()=> {
            this.profile.myPinnedCourses.unshift(pc);
            console.log('this course is added to pinned courses!');
            // also, check here if the innerhtml automatically gets converted to new status
            document.getElementById('coursePinButton').innerText = `Unpin`;
            // now add myprofile to skill subset
            this.firebaseService.AddStudentReferenceInPinnedCourse(studentInPinnedCourse,pc.id)
          });

        } else {

          let pinnedCourse = new MyPinnedCourses();
          let listOfPinnedCourses = this.profile.myPinnedCourses;
          for (let index = 0; index < listOfPinnedCourses.length; index++) {
          const element = listOfPinnedCourses[index];
              if(this.courseId === element.id){
                pinnedCourse = element;
                break;
              } else {
                
              }
          
           }
          // Unpin this course and set the status as Pin
          // get this pinned course array
         
          this.firebaseService.removeCourseFromMyPinnedCourses(this.myFId,pinnedCourse).then( () => {
            document.getElementById('coursePinButton').innerText = `Pin`;
            // remove me from my pinned Courses
            this.firebaseService.removeMyStudentObjectAfterIunpinACourse(pinnedCourse.id, this.myFId).then( () => {
              // remove this pinned course from my object
              try {
                this.profile.myPinnedCourses.splice(this.profile.myPinnedCourses.indexOf(pinnedCourse,1));
    
              } catch ( e) {
                console.log(e);
              }
            })
          });

        }
      }
}
