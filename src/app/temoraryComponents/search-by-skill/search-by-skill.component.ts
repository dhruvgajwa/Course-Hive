import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SKILLS } from 'src/app/Models/Profile';
import { Router} from  '@angular/router';
import { SearchService} from  '../../services/search.service';
import {FirebaseService} from '../../services/firebase.service';

@Component({
  selector: 'app-search-by-skill',
  templateUrl: './search-by-skill.component.html',
  styleUrls: ['./search-by-skill.component.css']
})

// Test all the functions related to this skill search thing and it definatedly needs  a better UI
// Aslo, Reduce the global font size in case for mobile devices and the row thing is also breaking down,
// ultimately need to create all basic classes provided by bootsrap and 
// It is just making thewhole module large as of now!




export class SearchBySkillComponent implements OnInit {
  @Output() returnSkill = new EventEmitter();

  // make this input output only
  // means on Click it should emit the clicked course Only

 
  skillName: string = '';
  filteredSkills: SKILLS[] = [];
  lastKeypress: number = 0;
  
  constructor(private searchService: SearchService, private router: Router,
              private firebaseService: FirebaseService) { }

  ngOnInit() {
  }

  SearchClicked(){
    // add handle code here!
    let skill = new SKILLS();
    skill.name = this.skillName;
    skill.id = this.searchService.getRealtimeDBid();
    skill.createdOn = new Date().getTime();
    skill.icon = '';
 
        // This Skill doesn't exists by this id or name! So please create a new One
        this.firebaseService.setNewSkill(skill).then( res => {
          this.returnSkill.emit(skill);
        }).catch(e => {
          alert(`Cant find this in database,...... ${e} `);
        }) 
   
   


    // the code for checking of there is a skill in the database 
    // and if not there then need to create one!!!
    // ehere is hat fucking cide?
    

  }
  MatOptionClicked(skill: SKILLS){
    // check if there is skill in the database or not! If not there rthen create onw!


    this.firebaseService.getSkillByID(skill.id).subscribe( res => {
      if(res === undefined || res === null){
        // This Skill doesn't exists by this id or name! So please create a new One
        this.firebaseService.setNewSkill(skill).then( res => {
          this.returnSkill.emit(skill);
        }).catch(e => {
          alert(`Cant find this in database,...... ${e} `);
        }) 
      } else {
        this.returnSkill.emit(skill);
      }
    }) 
    
  }
  // Create a script to copy data from profile data in firestore to realtime database

  
  KeyDown($event) {

   // als here we are initiating the autoocomplete
    console.time('Keydown');
    if ($event.key === 'Enter') {
     // this.SearchClicked();
      return;
    }

    if($event.keyCode < 65 || $event.keyCode > 105) {
      return;
    }

   
      let q =  this.setFirstLetterCapital($event.target.value);
    
    this.searchService.searchSkill(q).subscribe( res => {
      if(res.length === 0 && this.filteredSkills.length < 2){

        if(this.filteredSkills[0] !== undefined ){
          if($event.target.value.includes(this.filteredSkills[0].name)){
            this.filteredSkills.pop();
          }
        }

        let newSKill = new SKILLS();
        newSKill.name = $event.target.value;
        newSKill.id = this.searchService.getRealtimeDBid();
        newSKill.icon = '';
        newSKill.createdOn = new Date().getTime();
        this.filteredSkills.push(newSKill);
      }



      res.forEach((m: SKILLS) => {
        console.log(m['name'])

        
        this.filteredSkills.push(m);
        if(this.filteredSkills.length  >5){
          // also check if alredat present
          this.filteredSkills.shift();
        }
        
      });

      // code to remove the irrelated versions of text!!
      // also in future try to put the string matching score wala thing!
      for(let i = 0; i <  this.filteredSkills.length; i++) {
        if(!$event.target.value.includes(this.filteredSkills[i].name)) {
          this.filteredSkills.splice(i,1);
      }
      }

     

      
    });
    console.timeEnd('Keydown');
  
   


  }
  setFirstLetterCapital(s: string): string {
    let p : string;
  
    console.log(s);
    let f =  s.substr(0, 1);
    p = f.toUpperCase() + s.substr(1,s.length);
    console.log(p);
    return p;
  
  }

}
  