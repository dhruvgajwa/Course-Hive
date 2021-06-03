import { Component, OnInit } from '@angular/core';
import { SearchService} from  '../../services/search.service';
import { Router} from '@angular/router';
import { Profile } from 'src/app/Models/Profile';

// remove after running the profiles upload wala script
import { AngularFirestore } from '@angular/fire/firestore';
import {AngularFireDatabase } from '@angular/fire/database';


@Component({
  selector: 'app-search-student-by-name',
  templateUrl: './search-student-by-name.component.html',
  styleUrls: ['./search-student-by-name.component.css']
})
export class SearchStudentByNameComponent implements OnInit {
  studentName: string = '';
  filteredStudents: Profile[] = [];
  lastKeypress: number = 0;
  
  constructor(private searchService: SearchService, private afs: AngularFirestore, private db: AngularFireDatabase, private router: Router) { }

  ngOnInit() {
  }

  MatOptionClicked(student: Profile){
    let s = ''; // profile ID;
    console.log('navigating');
    this.router.navigate(['profile/' + student.fId ]);
  }

  // Create a script to copy data from profile data in firestore to realtime database

  KeyDown($event) {

   // als here we are initiating the autoocomplete
    console.log($event);
    if ($event.key === 'Enter') {
    //  this.MatOptionClicked();
      return;
    }
    if($event.keyCode < 65 || $event.keyCode > 105) {
      return;
    }
    if ($event.timeStamp - this.lastKeypress > 100) {
      let q =  this.setFirstLetterCapital($event.target.value);
    
    this.searchService.searchStudentByNameInRealtimeDB(q).subscribe( res => {
      res.forEach((m: Profile) => {
        console.log(m['name'])
        this.filteredStudents.push(m);
        if(this.filteredStudents.length  >5){
          this.filteredStudents.shift();
        }
        
      });

      
    });
    

    if(q.length < 7 ) {
      this.searchService.searchStudentByRollNoInRealtimeDB(q.toUpperCase()).subscribe( res => {
        res.forEach((m:Profile) => {
          console.log(m['rollNo']);
          this.filteredStudents.push(m);
          if(this.filteredStudents.length  >5){
            this.filteredStudents.shift();
          }
        });
  
        
      });
    }

 
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

  CopyTheDataFromFirestoreToRealtimeDatabase(){
    // first get the while data

    this.afs.collection('Profiles').valueChanges().subscribe( (data: Profile[]) => {

      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        
        // now uplaod this to realtimedatabase
        this.db.list('Profiles').set(element.rollNo, Object.assign({}, element)).then(()=> {
          console.log(element.rollNo, index, 'Sucess');
        }).catch(e => {
          console.log(element.rollNo, index, 'Failure', e);
        });
      }
  
    })
  }
}
