import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { Course } from 'src/app/Models/Course';
import { Observable, merge } from 'rxjs';
import { scan } from 'rxjs/operators';
import {SearchService } from '../../services/search.service';
//import * as data  from '../../../../u4.json';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  @Output() addCourseToMyPinnedCourses = new EventEmitter();

  CourseId: string = '';
  total: number = 0;
  done: number = 0;
  filteredCoursesList:Course[] = [];
  lastKeypress: number = 0;
  filteredCourses:Observable<Course[]> = new Observable<Course[]>();
  constructor(private router: Router,
              private firebaseService: FirebaseService,
              private searchService: SearchService) {

   }

  ngOnInit() {

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





    // als here we are initiating the autoocomplete
    console.log($event);
    if ($event.key === 'Enter') {
      this.SearchClicked();
      return;
    }
    if ($event.timeStamp - this.lastKeypress > 100) {
      let q =  this.setFirstLetterCapital($event.target.value);
      
     
    //  this.filteredCourses=  this.searchService.searchCouseByName(q.toUpperCase()); 
      // .subscribe(res => {
      //     this.filteredCourseString = res;
      //     console.log(res);
      //   });
    //   this.filteredCourses = this.searchService.searchCouseByName(q);
    // this.filteredCourses= merge(this.searchService.searchCouseByName(q),
    // this.searchService.searchCourseByID(q.toUpperCase()));
      
      console.log(q, q.toUpperCase())
      
    this.searchService.searchCouseByName(q).subscribe( res => {
      res.forEach(m => {
        console.log(m['name'])
        this.filteredCoursesList.push(m);
        if(this.filteredCoursesList.length  >5){
          this.filteredCoursesList.shift();
        }
      
      //  console.log(m['name'])
      });

      
    });
    

    if(q.length < 7 ) {
      this.searchService.searchCourseByID(q.toUpperCase()).subscribe( res => {
        res.forEach(m => {
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
  setFirstLetterCapital(s: string): string {
    let p : string;
  
    console.log(s);
    let f =  s.substr(0, 1);
    p = f.toUpperCase() + s.substr(1,s.length);
    console.log(p);
    return p;
  
  }

  MatOptionClicked(course: Course) {
    this.addCourseToMyPinnedCourses.emit(course);
  }

}
