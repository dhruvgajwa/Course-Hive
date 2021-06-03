import { Injectable } from '@angular/core';
import { Profile } from 'src/app/Models/Profile';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  profile: Profile;
  constructor() { }

  getProfileData(){
      return this.profile;
  }
  setProfileData(pro: Profile){

    if(pro !== undefined) {
      this.profile = new Profile();
      this.profile = pro;
    }
  }

  
}
