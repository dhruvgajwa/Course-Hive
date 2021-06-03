import { Injectable } from '@angular/core';
import { MyNotifications } from '../Models/Profile';
import { FirebaseService} from '../services/firebase.service';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private firebaseService: FirebaseService) { }

  senNotifications(heading: string, body: string, clickhandle: string, date: number, sendTo:string[]){
    // create the notification headiong, body, clickhandle and received date
    // sendTo : is the array of firebase id's send notification to
    // then get whom to send notification?(multiple people or just some single person);



    let notification = new MyNotifications();
    notification.body = body;
    notification.heading = heading;
    notification.clickLink= clickhandle;
    notification.receivedOn = date;


    sendTo.forEach( (fID: string) => {
      this.firebaseService.addNotificationToStudent(fID, notification); // this is by default asyncronous! {it's a promise}
    })
  }
}


