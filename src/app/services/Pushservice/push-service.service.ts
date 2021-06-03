import { Injectable } from '@angular/core';
import {AngularFireDatabase } from '@angular/fire/database';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PushServiceService {

  constructor(private db: AngularFireDatabase) { 
   
  }
 

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  sendpushSubscriptionObjectToServer(pushSubscription: string, userID: string, option: string){  // pushSubscription has to be json string
    // option has to be either, DChrome, DMozzila, MChrome, MMozilla
    return this.db.object(`PushObject/${userID}/${option}`).set(pushSubscription);
  }

  getpushSubscriptionObjectFromServer(userID: string, option: string){
     return this.db.object(`PushObject/${userID}/${option}`).valueChanges().pipe(take(1)); ;
  }

  // code for click handle in nsgw-worker.js
//   onClick(event) {
//     // Handle the click event and keep the SW alive until it's handled.
//     if(this.scope.clients !== undefined) {
//         if(event.notification['data']['click'] !== undefined) {
//             this.scope.clients.openWindow(event.notification['data']['click']).then(function(WindowClient) {
//                 // Do something with your WindowClient
//               });
//         } else {
//             this.scope.clients.openWindow(`https://coursehive.in/home`).then(function(WindowClient) {
//                 // Do something with your WindowClient
//               });
//         }
        
//     } else {
//         console.log('scope is undefined');
//     }
   
//     // Handle the click event and keep the SW alive until it's handled.
//     event.waitUntil(this.handleClick(event.notification, event.action));
// }
}
