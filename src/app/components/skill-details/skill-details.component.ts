import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { FirebaseService} from '../../services/firebase.service';
import { SKILLS, MySkills, StudentsInSkills, Profile } from 'src/app/Models/Profile';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { DataSharingService } from '../../services/DataService/data-sharing.service';
import {AuthService} from '../../services/auth.service';
@Component({
  selector: 'app-skill-details',
  templateUrl: './skill-details.component.html',
  styleUrls: ['./skill-details.component.css']
})




/*
TODO: Make a complete strategy of how to make this this/portion useful...
WHat you have to pich in there?
Ask more what students want?
Pitch it as skill share
!! Aslo add a button where you can add yourself to that skill!!!
Also, make it as a point where students can create and publish events for that specidfic skill!!
This cam be later upgraded to interschool communication system!

2*************
The point where people can see your pic in any skill... please make it better!
It's really important!!! Also, a point where someone can directly send you message! It's relly important

*/













export class SkillDetailsComponent implements OnInit {
   skill: SKILLS = new SKILLS();
   allStudents: any[] = [];
   profile = new Profile();
   skillId: string = '';
  constructor( private activatedRoutes: ActivatedRoute,
               private firebaseServie: FirebaseService,
               private router: Router,
               private authService: AuthService,
               private loadingBar: LoadingBarService,
               private dataSharingService: DataSharingService) { }

  ngOnInit() {
    this.loadingBar.start();
    this.activatedRoutes.params.subscribe( (params:Params) => {
      this.skillId = params.id;
      // now get add the data from skillname
      this.firebaseServie.getSkillByIDforSkillDetailsPage(params.id).subscribe( (res: SKILLS) => {
        // this response is an object
        console.log(res,"From Skill Details COmponent");
        if(res === undefined || res === null) {
          console.log('Skill requested is', res);
          this.loadingBar.complete();
          this.loadingBar.stop();
        } else {
          this.skill = res;
          if(res['students'] === null || res['students'] === undefined) {
            
           
          } else {
            this.allStudents = Object.values(res['students']);
          }
         
          console.log(this.allStudents);
          console.log(res);
          this.loadingBar.complete();
          this.loadingBar.stop();
        }
       
      })
    });

    // handle profile data in this component
    console.log('data sharing service iss',this.dataSharingService.getProfileData());
    if(this.dataSharingService.getProfileData() !== undefined) {
      this.profile = this.dataSharingService.getProfileData();
      if(this.profile.mySkills.length > 0) {
        for (let index = 0; index < this.profile.mySkills.length; index++) {
          const element = this.profile.mySkills[index];
          
          if(this.skillId === element.id){
            document.getElementById('skillPinButton').innerText = `Unpin`;
            break;
          } else {
            document.getElementById('skillPinButton').innerText = `Pin`;
          }
          
        }
      } else {
        document.getElementById('skillPinButton').innerText = `Pin`;
      }
    } else {
      this.firebaseServie.getMyProfileData(this.authService.getMyFId()).subscribe ( res => {
        this.profile = res;
        console.log('res ponse reci', res);
        this.dataSharingService.setProfileData(res);
        // now set the profile dependent tags
        if(this.profile.mySkills.length > 0) {
          for (let index = 0; index < this.profile.mySkills.length; index++) {
            const element = this.profile.mySkills[index];
            
            if(this.skillId === element.id){
              document.getElementById('skillPinButton').innerText = `Unpin`;
              break;
            } else {
              document.getElementById('skillPinButton').innerText = `Pin`;
            }
            
          }
        } else {
          document.getElementById('skillPinButton').innerText = `Pin`;
        }

       

      })
    }
  }

  getImage(roll: string) {
    return `https://photos.iitm.ac.in/byroll.php?roll=${roll.toUpperCase()}`
  }
  contactMe(fID: string ){
    this.router.navigate(['profile/'+ fID]);
  }

  saveAsYourSkill(){
    let mySkill = new MySkills();
    

   

      mySkill.id = this.skill.id;
      mySkill.name = this.skill.name;
      mySkill.addedOnDate = new Date().getTime();
  

     // also check if the skil is already existing? 
      // maybe set the id as some recognisable shit and onto that add some shit! will make sense thought!
      
      //if the skill is not in database
      

    
        this.firebaseServie.addSkillInStudentData(mySkill, this.authService.getMyFId()).then(()=> {
          console.log('added To My Skills');
          document.getElementById('skillPinButton').innerText = `Unpin`;
          let studentInSkill = new StudentsInSkills();
          studentInSkill.name = this.profile.name;
          studentInSkill.rollNo = this.profile.rollNo;
          studentInSkill.addedOn = new Date().getTime();
          studentInSkill.studentFId = this.authService.getMyFId();
          this.firebaseServie.addStudentToSkill(studentInSkill,mySkill.id);
        });    
      
      
      // add this skill to MySkills
    
  }

}
