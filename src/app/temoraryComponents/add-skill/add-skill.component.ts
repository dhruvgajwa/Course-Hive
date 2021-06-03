import { Component, OnInit } from '@angular/core';
import { SKILLS, StudentsInSkills } from 'src/app/Models/Profile';
import {FirebaseService} from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-add-skill',
  templateUrl: './add-skill.component.html',
  styleUrls: ['./add-skill.component.css']
})
export class AddSkillComponent implements OnInit {

  constructor(private firebaseService: FirebaseService,
              private auhService: AuthService) { }

  ngOnInit() {
  }

  addNewSkill(){
    // need to write a script to find icons by skill name!
    let name = (document.getElementById('name') as HTMLInputElement).value;
    let iconStr = (document.getElementById('img') as HTMLInputElement).value;
    //let iconStr = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjDE13MH9jhCagcixFHvCnvq1sV09ZdgkYTLu6YcGdTJbrVmH4wQ&s';
    let Skill = new SKILLS();
    Skill.name = name;
    Skill.icon = iconStr;
    this.firebaseService.setNewSkill(Skill).then(res => {
      console.log(res);
    });

  }

  addStudentToSkill() {
    let student = new StudentsInSkills();
    student.name = 'Dhruv';
    student.rollNo = 'ED16B008';
    student.studentFId = this.auhService.getMyFirebaseId();
    student.addedOn = new Date().getTime();
    

  }

}
