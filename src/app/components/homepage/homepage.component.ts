import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { Course } from 'src/app/Models/Course';
import { Observable, merge } from 'rxjs';
import { scan } from 'rxjs/operators';
import {SearchService } from '../../services/search.service';
import * as data  from '../../../../EvenSem.json';
import { SKILLS } from 'src/app/Models/Profile';
// look for this file u4

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  CourseId: string = '';
  total: number = 0;
  done: number = 0;
  options = ['Courses', 'Students', 'Skills'];
  searchByCourseDIV;
  searchByStudentDIV;
  searchBySkillDIV;
  selectElement;
  filteredCoursesList:Course[] = [];
  lastKeypress: number = 0;
  filteredCourses:Observable<Course[]> = new Observable<Course[]>();
  constructor(private router: Router,
              private firebaseService: FirebaseService,
              private searchService: SearchService) {

   }

  ngOnInit() {
    this.searchByCourseDIV = document.getElementById('searchByCourseDIV');
    this.searchByStudentDIV = document.getElementById('searchByStudentDIV');
    this.searchBySkillDIV = document.getElementById('searchBySkillDIV');
    this.selectElement = document.getElementById('options');

  }
  SelectOptionChanged(e: Event) {
    const target = (e.target as HTMLSelectElement).value;
    if(target === '0') {
      this.searchByCourseDIV.style.display = '';
      this.searchByStudentDIV.style.display = 'none';
      this.searchBySkillDIV.style.display = 'none';
    }
    else if(target === '1') {
      this.searchByCourseDIV.style.display = 'none';
      this.searchByStudentDIV.style.display = '';
      this.searchBySkillDIV.style.display = 'none';
    }
    else if(target === '2') {
      this.searchByCourseDIV.style.display = 'none';
      this.searchByStudentDIV.style.display = 'none';
      this.searchBySkillDIV.style.display = '';
    }
    
  }
  SearchClicked() {
    if (this.CourseId.length < 5) {
      alert('Not a Valid CourseId');
      return;
    }
    let s: string = this.makeCourseIdSuitable(this.CourseId);
    this.router.navigate(['/course/' + s]);
  }
  makeCourseIdSuitable(CourseId: string): string {
    let s1 = CourseId.slice(0, 2).toUpperCase();
    let s2 = CourseId.slice(2, 6);
    return s1 + s2;
  }

  KeyDown($event) {
    if ($event.key === 'Enter') {
      this.SearchClicked();
      return;
    }
    if($event.keyCode < 65 || $event.keyCode > 105) {
      return;
    }

    console.log($event);
    
    if ($event.timeStamp - this.lastKeypress > 50) {  
      let q =  this.setFirstLetterCapital($event.target.value);

      console.log(q, q.toUpperCase())
      
    this.searchService.searchCouseByNameInRealtimeDB(q).subscribe( (res:Course[]) => {
      res.forEach(m => {
        console.log(m['name'])
        this.filteredCoursesList.push(m);
        if(this.filteredCoursesList.length  >5){
          this.filteredCoursesList.shift();
        }
      });

      
    });
    
    if(q.length < 7 ) {
      this.searchService.searchCourseByIDInRealtimeDB(q.toUpperCase()).subscribe( res => {
        res.forEach((m: Course) => {
          console.log(m['id']);
          this.filteredCoursesList.push(m);
          if(this.filteredCoursesList.length  >5){
            this.filteredCoursesList.shift();
          }
        });
  
        
      });
    }

 
  }
   
  this.lastKeypress = $event.timeStamp;

  }

  
  // demoFunction() {
  //   this.total = data.default.length;
  //   const coursesList = data.default;
  //   let course: Course = new Course();
  //   for( let i = 0; i < coursesList.length ; i++) {
  //   course = new Course();
  //   // tslint:disable-next-line: no-string-literal
  //   course.id = coursesList[i]['Course No'];
  //   course.credits = coursesList[i]['New Credit'];
  //   course.instructerName = coursesList[i]['Instructor Name'];
  //   course.maxStrength = coursesList[i]['Maxoverallstrength'];
  //   course.name = coursesList[i]['Course Name'];
  //   course.offeredForBTechDD = coursesList[i]['OfferedforBTechDD'];
  //   course.preq = coursesList[i]['Prereq'];
  //   course.room = coursesList[i]['Room'];
  //   course.slot = coursesList[i]['Slot'];
  //   course.additionalSlot = coursesList[i]['Additional Slot'];
  //   console.log(course);

  //   this.firebaseService.AddACourse(course).then( _ => {
  //     this.done = this.done + 1 ;
  //   });

  //   }
  //  }



  // A script to write the course data into the realtime database

// uploadCourseInRealtimeDB(){
   
//     this.total = data.default.length;
//     console.log(this.total);
//     const coursesList = data.default;
//     let course: Course = new Course();

//     for( let i = 0; i < coursesList.length ; i++) {
//     course = new Course();
//     // tslint:disable-next-line: no-string-literal
//     course.id = coursesList[i]['Course No'];
//     course.credits = coursesList[i]['New Credit'];
//     course.instructerName = coursesList[i]['Instructor Name'];
//     course.maxStrength = coursesList[i]['Maxoverallstrength'];
//     course.name = coursesList[i]['Course Name'];
//     course.offeredForBTechDD = coursesList[i]['OfferedforBTechDD'];
//     course.preq = coursesList[i]['Prereq'];
//     course.room = coursesList[i]['Room'].toString();
//     course.slot = coursesList[i]['Slot'];
//     course.additionalSlot = coursesList[i]['Additional Slot'];
//     console.log(course);

//    try {
//     this.firebaseService.AddACourseToRealtimeDatabase(course).then( _ => {
//       this.done = this.done + 1 ;
//       console.log(this.done , 'Added');
//     }).catch(e => {
//       console.log(e);
//     });
//    } catch ( e) {
//      console.log(e);
//    }

//     }
// }

  setFirstLetterCapital(s: string): string {
    let p : string;
  
    console.log(s);
    let f =  s.substr(0, 1);
    p = f.toUpperCase() + s.substr(1,s.length);
    console.log(p);
    return p;
  
  }
  returnSkill(skill: SKILLS){
    // appare
    this.router.navigate(['/skill/'+ skill.id]);
  }
  

  // check if the user has not uploaded any document, as him/her to do so! And also add some other shit!
}
