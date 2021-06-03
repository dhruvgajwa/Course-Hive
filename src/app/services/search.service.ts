import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {AngularFireDatabase } from '@angular/fire/database';

import {Course} from '../Models/Course';
import { SKILLS, StudentsInSkills } from '../Models/Profile';



@Injectable({
  providedIn: 'root'
})
export class SearchService {

  getnewSkillID(){
    return this.db.createPushId();
  }

  // test and add .pipe(take(1)); tafter valuechanges()
  constructor(private afs: AngularFirestore, private db: AngularFireDatabase  ) { }
  searchCouseByName(name: string){
    return this.afs.collection<Course>('Courses', ref => ref.orderBy('name').startAt(name).limit(3)).valueChanges();
  }

  searchCourseByID(id: string) {
    return this.afs.collection<Course>('Courses', ref => ref.orderBy('id').startAt(id).limit(3)).valueChanges();
  }


  searchCouseByNameInRealtimeDB(name: string){
    return this.db.list('Courses',  ref => ref.orderByChild	('name').startAt(name).limitToFirst(3)).valueChanges();
  
  }

  searchCourseByIDInRealtimeDB(id: string) {
    return this.db.list('Courses',  ref => ref.orderByChild	('id').startAt(id).limitToFirst(3)).valueChanges();
  }

  searchSkill(name: string) {
   
    return this.db.list<SKILLS>(`skills`, ref => ref.orderByChild('name').startAt(name).limitToFirst(3)).valueChanges();
  }

  searchStudentByNameInRealtimeDB(name: string) {
    // check the capitalism for that tag: name
    return this.db.list('Profiles',  ref => ref.orderByChild	('name').startAt(name).limitToFirst(3)).valueChanges();
  }
  searchStudentByRollNoInRealtimeDB(rollNo: string) {
    // check the capitalism for that tag: name
    return this.db.list('Profiles',  ref => ref.orderByChild	('rollNo').startAt(rollNo).limitToFirst(3)).valueChanges();
  }

  searchStudentsBySkill(skillID: string) {
    return this.db.list<StudentsInSkills>(`skills/${skillID}/students`);
  }
  
  getRealtimeDBid(){
    return this.db.createPushId();
  }

  

}
