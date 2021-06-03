import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SKILLS } from 'src/app/Models/Profile';
import { SearchService} from '../../services/search.service';
@Component({
  selector: 'app-skill-search',
  templateUrl: './skill-search.component.html',
  styleUrls: ['./skill-search.component.css']
})


// All Skills must be small case to store in....
// Their visuallity can be changed here!

export class SkillSearchComponent implements OnInit {
  skillInput: string= '';
  lastKeypress: number = 0;

  filteredSkillList:SKILLS[] = [];
  constructor(private searchService: SearchService) { }

  ngOnInit() {
 
  }
  SearchClicked() {
    if (this.skillInput.length < 5) {
      alert('Not a Valid CourseId');
      return;
    }
    let s: string = this.makeCourseIdSuitable(this.skillInput);
    // this.router.navigate(['/course/' + s]);
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
      console.log(q, q.toUpperCase())
      
    this.searchService.searchSkill(q).subscribe( res => {
      res.forEach(m => {
        console.log(m['name'])
        this.filteredSkillList.push(m);
        if(this.filteredSkillList.length  >5){
          this.filteredSkillList.shift();
        }
      
      //  console.log(m['name'])
      });

      
    });
    

 
  }
   
  this.lastKeypress = $event.timeStamp;

  }
  setFirstLetterCapital(s: string): string {
    let p : string;
  
    console.log(s);
    let f =  s.substr(0, 1);
    p = f.toUpperCase() + s.substr(1,s.length);
    console.log(p);
    return p;
  
  }

  MatOptionClicked(skill: SKILLS) {
  //  this.addCourseToMyPinnedCourses.emit(course);
  }
  

}
