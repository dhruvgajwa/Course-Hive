import { Component, OnInit } from '@angular/core';
import { AuthService} from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { Profile, MyPinnedCourses, StudentsInPinnedCourse, MySkills, SKILLS , StudentsInSkills, MyNotifications} from 'src/app/Models/Profile';
import { Content, Review, Course } from 'src/app/Models/Course';
import {LoadingBarService} from '@ngx-loading-bar/core';
import { Router} from '@angular/router';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css']
})



export class MyprofileComponent implements OnInit {
  profile: Profile = new Profile();
  myFId: string = '';
  karmaPoints: number = 0;
  reviews: number = 0;
  uploads: number = 0;
  newlyPinnedCourses: MyPinnedCourses[]=[];
  constructor(private authService: AuthService,
              private firebaseService: FirebaseService,
              private loadingBarService: LoadingBarService,
              private router: Router) { }

  ngOnInit() {
    this.myFId =  this.authService.getMyFId();
    this.loadingBarService.start();
    this.firebaseService.getMyProfileData(this.myFId).subscribe( (_doc) => {
        this.profile = _doc;
        console.log(this.profile);
      
        if(this.profile.myPinnedCourses === undefined) {
          this.profile.myPinnedCourses = [];
        }
        if(this.profile.myNotifications === undefined) {
          this.profile.myNotifications = [];
        }

        if (_doc !== undefined) {
          this.loadingBarService.stop();
          this.firebaseService.getUploadsById(this.myFId).subscribe( (data: Content[]) => {
            if (data === undefined) {
              this.profile.myUploads = [];
            } else {
              this.profile.myUploads = data;
              this.calculate();
            }
          });
          this.firebaseService.getReviewsById(this.myFId).subscribe( (data: Review[]) => {
            if (data === undefined) {
              this.profile.myReviews = [];
            } else {

            this.profile.myReviews = data;
            this.calculate();
            }
          });
        }

      } );
  }
  isMyUploadsDefined() {
    if (this.profile.myUploads !== undefined) {
      console.log(this.profile.myUploads.length);
      if ( this.profile.myUploads.length > 0 ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isMyReviewsDefined() {
    if (this.profile.myReviews !== undefined) {
      if ( this.profile.myReviews.length > 0 ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getDate(n: number) {
    return new Date(n).toDateString();
  }

  DeleteReview(review: Review) {
    this.firebaseService.deleteReview( review, this.myFId).then( _ => {
      this.profile.myReviews.splice(this.profile.myReviews.indexOf(review), 1);
    });
  }

  DeleteContent(content: Content) {
    this.firebaseService.deleteContent( content, this.myFId).then( _ => {
      this.profile.myUploads.splice(this.profile.myUploads.indexOf(content), 1);
    });
  }


  calculate() {
    this.uploads = this.profile.myUploads.length;
    this.reviews = this.profile.myReviews.length;

    this.profile.myUploads.forEach((element: Content) => {
      this.karmaPoints = (element.upVotedBy.length * 5) + this.karmaPoints;
      this.karmaPoints =   this.karmaPoints - (element.downVotedBy.length * 5);

    });

    this.profile.myReviews.forEach((element: Review) => {
      this.karmaPoints = (element.upVotedBy.length * 5) + this.karmaPoints;
      this.karmaPoints =   this.karmaPoints - (element.downVotedBy.length * 5);

    });
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

    DownloadClicked(link: string) {
      window.open(link, '_blank');
    }

    myPinnedCoursesEditClicked(){
      console.log('clicked');
      document.getElementById('myPinnedCoursesSearch').style.display = 'block';
      document.getElementById('myPinnedCoursesSave').style.display ='inline-block';
      document.getElementById('myPinnedCoursesEdit').style.display = 'none';
     
      let coll = document.getElementsByClassName('removeMyPinnedCourse');

      for(let i =0; i<coll.length; i++) {
        (coll.item(i) as HTMLElement).style.display = '';
      }

      // also show an option to remove courses from the list~
      // 
    }



    addCourseToMyPinnedCourses(course: Course) {
      console.log(course);
      let pc = new MyPinnedCourses();
      pc.id = course.id;
      pc.name = course.name;
      let flag = true;

        // Check if already contain this course
      this.profile.myPinnedCourses.forEach((element: MyPinnedCourses )=> {
      if(pc.id === element.id){
          flag = false;
        }        
      });
    
      if(flag) {
        pc.pinnedAtDate = new Date().toUTCString();
        // Send this pinned course querry to backend
        // Also add the student in pinned course wala part
  
        let studentInPinnedCourse = new StudentsInPinnedCourse();
        studentInPinnedCourse.name = this.profile.name;
        studentInPinnedCourse.rollNo = this.profile.rollNo;
        studentInPinnedCourse.studentFID = this.profile.fId;
        studentInPinnedCourse.addedOn = new Date().getTime();
        // Now Add this studentInPinnedCOurse to backed
        // here update to backend
        this.firebaseService.savePinnedCourses(this.myFId,pc).then(()=> {
          this.profile.myPinnedCourses.unshift(pc);
          // now add myprofile to skill subset
          this.firebaseService.AddStudentReferenceInPinnedCourse(studentInPinnedCourse,pc.id)
        });
        // aso set the newly Added course background to some different color
      }
    }

    SaveMyPinnedCourses(){
      document.getElementById('myPinnedCoursesSearch').style.display = 'none';
      document.getElementById('myPinnedCoursesSave').style.display ='none';
      document.getElementById('myPinnedCoursesEdit').style.display = 'inline';
      // the courses are already saved to database! Here we are just changinf the display properties of objects 
    }


    mySkillsEditClicked(){
      document.getElementById('mySkillsSearch').style.display = 'block';
      document.getElementById('mySkillsEdit').style.display = 'none';

      let coll = document.getElementsByClassName('removeMySkills');

      for(let i =0; i<coll.length; i++) {
        (coll.item(i) as HTMLElement).style.display = '';
      }
    }

    RemoveThisSkill(skill: MySkills){
      this.firebaseService.removeSkillFromMySkills(this.myFId,skill).then( () => {
        // remove me from my pinned Courses
        this.firebaseService.removeMyStudentObjectAfterIRemoveASkill(this.myFId, skill.id).then( () => {
          // remove this pinned course from my object
          try {
            this.profile.mySkills.splice(this.profile.mySkills.indexOf(skill,1));

          } catch ( e) {
            console.log(e);
          }
        });
    });
  }

    SaveMySkills(){
      let mySkill = new MySkills();
      mySkill.description = (document.getElementById('newSkillDescription') as HTMLInputElement).value;
      let newSKillJSON =JSON.parse((document.getElementById('newSKillJSONString') as HTMLInputElement).value);
      // checking if this skill is already in database

      this.firebaseService.getSkillByID(newSKillJSON['id']).subscribe( res => {
        if(res === undefined || res === null) {
          // create a new skill document in the Skills, and skills subset!
         // this.firebaseService.setNewSkill()
         this.firebaseService.setNewSkill(newSKillJSON).then(res => {
           console.log(res, "NEw Skill Added");
         }).catch(e => {
           console.log(e);
         });
        }
      })

      mySkill.id = (document.getElementById('newSkillID') as HTMLInputElement).value;
      mySkill.name = (document.getElementById('newSkillName') as HTMLInputElement).value;
      var AllLevelRadioButtons = document.getElementsByName('newSkillExpertiseLevel');
     
      for(var i = 0; i < AllLevelRadioButtons.length; i++){
          if((AllLevelRadioButtons[i] as HTMLInputElement).checked){
            mySkill.expertiseLevel = (AllLevelRadioButtons[i] as HTMLInputElement).value;
          }
      }
      mySkill.addedOnDate = new Date().getTime();
      //   mySkill.id = ' Some I';
      // document.getElementById('mySkillsSearch').style.display = 'block';
      // document.getElementById('mySkillsEdit').style.display = 'none';
      this.profile.mySkills.unshift(mySkill);
      document.getElementById('mySkillsSearch').style.display = 'none';
      document.getElementById('mySkillsEdit').style.display = 'inline';
      let coll = document.getElementsByClassName('removeMySkills');

      for(let i =0; i<coll.length; i++) {
        (coll.item(i) as HTMLElement).style.display = 'none';
      }

      // also check if the skil is already existing? 
      // maybe set the id as some recognisable shit and onto that add some shit! will make sense thought!
      
      //if the skill is not in database
      

      if(mySkill.name === 'Default ') {
        return;
      } else {
        this.firebaseService.addSkillInStudentData(mySkill, this.myFId).then(()=> {
          console.log('added To My Skills');
          let studentInSkill = new StudentsInSkills();
          studentInSkill.name = this.profile.name;
          studentInSkill.rollNo = this.profile.rollNo;
          studentInSkill.addedOn = new Date().getTime();
          studentInSkill.studentFId = this.myFId;
          this.firebaseService.addStudentToSkill(studentInSkill,mySkill.id);
        });    
      }
      
      // add this skill to MySkills
    }

    RemoveThisPinnedCourse(e:Event ,pinnedCourse: MyPinnedCourses){
      e.stopPropagation();
      this.firebaseService.removeCourseFromMyPinnedCourses(this.myFId,pinnedCourse).then( () => {
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
    
    // to handle event emitter from the skill searh component
    returnSkill(skill: SKILLS){
      console.log(JSON.stringify(skill),`Skill from emit event`);
      (document.getElementById('newSKillJSONString') as HTMLInputElement).value =JSON.stringify(Object.assign({},skill));
      (document.getElementById('newSkillName') as HTMLInputElement).value = skill.name;
      (document.getElementById('newSkillID') as HTMLInputElement).value = skill.id;
    }
    // My Skills


    handleNotificationClick(link: string){
      window.open(link);
    }

    cleanNotifications(){
      this.profile.myNotifications = [];
      this.firebaseService.cleanNotifications(this.myFId);
    }
    checkGettingAllStudentsPinnedThisCOurse(){
      this.firebaseService.getAllStudentPinnedThisCourse('EE1101').subscribe(res => {
        console.log(res);
      })
    }
    OpenThisCourse(id: string){
      this.router.navigateByUrl(`/course/${id}`);
    }
    openThisSkill(id: string){
      this.router.navigateByUrl(`/skill/${id}`);
    }

    stopPropogation(e: Event){
      e.stopPropagation();
    }
   
}
