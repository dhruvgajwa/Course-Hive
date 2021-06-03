import { Component, OnInit } from '@angular/core';

import { AuthService} from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { Profile, MyPinnedCourses } from 'src/app/Models/Profile';
import {ActivatedRoute, Params} from '@angular/router';
import { Content, Review } from 'src/app/Models/Course';
import { Router} from '@angular/router';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // should show skills and pinned courses too ?
  profile: Profile = new Profile();
  isEmailVerfied = false;
  studentFID: string = '';
  karmaPoints: number = 0;
  reviews: number = 0;
  uploads: number = 0;
  myFId: string = '';
  constructor(private authService: AuthService,
              private router: Router,
              private firebaseService: FirebaseService,
              private activatedRoutes: ActivatedRoute) { }

  ngOnInit() {

    this.activatedRoutes.params.subscribe( (params: Params) => {
      this.studentFID = params.id;
    });
    this.myFId = this.authService.getMyFId();
    this.firebaseService.getProfileData(this.studentFID).subscribe( (_doc: Profile) => {
        console.log(this.authService.isEmailVerified());
        this.isEmailVerfied = this.authService.isEmailVerified();

        this.profile = _doc;
        console.log(this.profile);
        if(this.profile.mySkills === undefined){
          this.profile.mySkills = [];
        }
        // temporary
      


        if (_doc !== undefined) {
          this.firebaseService.getUploadsById(this.studentFID).subscribe( (data: Content[]) => {
              if (data === undefined) {
                this.profile.myUploads = [];
            } else {

              this.profile.myUploads = data;
              this.calculate();
            }
          });
          this.firebaseService.getReviewsById(this.studentFID).subscribe( (data: Review[]) => {
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
    let s: string = new Date(n).toDateString();
    return s;
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
    UpVoteClickedContent(content: Content) {
      if (!this.isEmailVerfied) {
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
        this.firebaseService.reverseUpVoteContent(content.courseId, content.fId, this.myFId, content.uploadedByFId);

      } else if (this.IDownVotedContent(content.downVotedBy) ) {
              // Upvote and Reverse DownVote
              // let index = this.course.reviews.indexOf(review);
              // let i2 = this.course.reviews[index].downVotedBy.indexOf(this.myFId);
              // if (i2 > -1) {
              //  this.course.reviews[index].downVotedBy.splice(index, 1);
              // }
        content.upVotedBy.push(this.myFId);
        content.downVotedBy.splice(content.downVotedBy.indexOf(this.myFId), 1);
  
        this.firebaseService.upvoteAndReverseDownvoteContent(content.courseId, content.fId, this.myFId, content.uploadedByFId);
      } else {
        // Just UpVote
        content.upVotedBy.push(this.myFId);
        this.firebaseService.upvoteContent(content.courseId, content.fId, this.myFId,content.uploadedByFId);
      }
    }
    DownVoteClickedContent(content: Content) {
      if (!this.isEmailVerfied) {
        alert('Email not verified! Verify to perform this task');
        return;
      }
      if (this.IDownVotedContent(content.downVotedBy)) {
        content.downVotedBy.splice(content.downVotedBy.indexOf(this.myFId), 1);
        this.firebaseService.reverseDownVoteContent(content.courseId, content.fId, this.myFId,content.uploadedByFId);
        // Reverse Downvote
  } else if (this.IUpvotedContent(content.upVotedBy) ) {
    content.upVotedBy.splice(content.upVotedBy.indexOf(this.myFId), 1);
    content.downVotedBy.push(this.myFId);
    this.firebaseService.downvoteAndReverseUpvoteContent(content.courseId, content.fId, this.myFId,content.uploadedByFId);
        // DownVote and Reverse UpVote
  } else {
    content.downVotedBy.push(this.myFId);
    this.firebaseService.downvoteContent(content.courseId, content.fId, this.myFId, content.uploadedByFId);
  // Just downVote
  }
}
OpenThisCourse(id: string){
  this.router.navigateByUrl(`/course/${id}`);
}
openThisSkill(id: string){
  this.router.navigateByUrl(`/skill/${id}`);
}

}
