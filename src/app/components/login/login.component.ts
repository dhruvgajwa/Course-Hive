import { Component, OnInit } from '@angular/core';
// for querring a collection
// import { Component } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, buffer, retry } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirebaseService } from '../../services/firebase.service';
import $ from 'jquery';
import { Profile } from 'src/app/Models/Profile';
import { auth } from 'firebase';
import { PushServiceService } from '../../services/Pushservice/push-service.service';
// for notification
import { SwPush , SwUpdate} from '@angular/service-worker';
import {DataSharingService} from '../../services/DataService/data-sharing.service';
import { environment} from '../../../environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  name: string;
  email: string;
  password: string;
  phone: string = '';
  cpassword: string;
  image: string;
  isSuccess = false;
  resetMessage = '';
  constructor( private authservice: AuthService,
              private router: Router,
              private firebaseService: FirebaseService,
              private modalService: NgbModal,
              private swPush: SwPush,
              private pushService: PushServiceService,
              private updates: SwUpdate,
              private dataSharingService: DataSharingService) {
  }

  ngOnInit() {
    console.log(this.getBrowserName());
     // checking for update using service worker

    this.updates.available.subscribe(event => {

      // here is should ask a question whether yes or no?
      if ((event.available !== event.current)) {
        this.updates.activateUpdate().then(() => document.location.reload());
      }
      console.log('current version is', event.current);
      console.log('available version is', event.available);

    });

    this.updates.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });
  

    this.swPush.notificationClicks.subscribe(
      ({action, notification}) => {
          // TODO: Do something in response to notification click.
          
          console.log(action, notification);
          window.open(`https://mail.google.com/mail/u/0/#inbox`);
      });




    // work is needed in thsi section of code!! Very Important
    // Need to have separate endspoints for chrome, mozilla, and phone options!
    //create the option tag
    let option = this.getTheOptionForNotificationSubcriptionObjectStorageTag();
    this.authservice.getAuth().subscribe( (auth) => {
      if (auth) {
        // Here show the add Some content shit wala modal !
        // better load all my data initially and then show modals! this is also a better idea!
        
        // check if the browser is chrome then reask for notification
        this.pushService.getpushSubscriptionObjectFromServer(this.authservice.getMyFId(), option).subscribe( (res: string) => {
          if(res === undefined || res === null) {
            console.log('res is undefindes');
           
            // ask to please allow notification display!
            this.subscribeToPush();
          }
          // } else {
          //   try {
          //     if(res.includes('https://updates.push.services.mozilla.com/') && this.getBrowserName() === 'chrome') {
          //       this.subscribeToPush();
          //     }
          //   } catch(e) {
          //     console.log(e);
          //   }
          // }
          // console.log(res);
        });
         this.router.navigate(['/home']);
      }
    });


    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton.addEventListener('click', () => {
      container.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
      container.classList.remove('right-panel-active');
    });
    
  }


  SignUpClicked() {

    if (this.verifyIsSmail(this.email)) {
      this.authservice.fetchEmail(this.email).then( data => {
        console.log(data.length);
        console.log(data);
  
  
        if (data.length === 0) {
  
  
          if (this.cpassword === this.password) {
  
            if (this.password.length > 5) {
              
              console.log('Redirectable');
  
             this.signUpUsingEmailAndPassword();
            } else {
              alert('password is too small! (should be longer than 6 characters!)')}
  
          } else {
            alert('Password doesnt match!! :-(');
          }
  
        } else {
          alert(this.email +  'is Already in use !!!');
          return;
        }
  
      });
  
    }

   

    // this.authservice.register(this.email,this.password)
    //   .then((res)=>{
    //     console.log(res);
    //     $(".check-icon").hide();
    //     setTimeout(function () {
    //       $(".check-icon").show();
    //     }, 10);


    //   }).catch((err)=>{
    //     console.error(err);

    //   });



  }
Login(content: any) {


  this.authservice.login(this.email, this.password)
  .then((res: any) => {
    console.log('USer data is =>',res);
    this.firebaseService.getMyProfileData(this.authservice.getMyFId()).subscribe( (_doc: Profile) => {
      console.log(_doc);
      this.dataSharingService.setProfileData(_doc);
    });


    this.pushService.getpushSubscriptionObjectFromServer(this.authservice.getMyFId(), 
      this.getTheOptionForNotificationSubcriptionObjectStorageTag()).subscribe( res => {
      if(res !== undefined){
        // ask to please allow notification display!
        this.subscribeToPush();
      }
    });

    this.modalService.open(content);
    $('.check-icon').hide();
    setTimeout(function () {
    $('.check-icon').show();
  }, 10);
    //re route from where it came
    //or to home page
    console.log(res);
  }).catch((err: any) => {
    console.log(err);
    alert(err);
    //re route to login page
  });

}

sendPasswordResetEmaail(content: any) {
  this.authservice.sendPasswordResetEmaail(this.email).then(_ => {
    console.log( _ );
    this.resetMessage = 'Link sent to your email address ' + this.email ;
    this.modalService.open(content);
  }).catch( err => {
    this.resetMessage = 'Cant send password reset link to  ' + this.email + ' err =>' + err ;
    console.log(err);
  });
}

    verifyIsSmail(s: string) {
    const index =  s.indexOf('@');
    console.log(s);
    let s2 = s.slice(index, s.length);
    let s1 = s.slice(0, index);
    console.log(s2);
    console.log(s1);

    if (s2 === '@smail.iitm.ac.in' && s1.length === 8 ) {
    // Valid smail

      let dept = s1.slice(0, 2).toUpperCase();
      const year: string = s1.slice(2, 4);
      let programme: string = s1.slice(4, 5).toUpperCase();
      let rolln: string = s1.slice(5, 8);
      this.email = dept + year + programme + rolln +  '@smail.iitm.ac.in';
      return true;

    } else {

      alert('InValid Smail');
      return false;
    }

}

signUpUsingEmailAndPassword() {
  this.image = 'https://photos.iitm.ac.in/byroll.php?roll=' + this.email.slice(0, 8); // Link to photos here take from photos.iitm
  this.authservice.register(this.email, this.password).then(_ => {

    

    let p = new Profile();
    p.image = this.image;
    p.fId = this.authservice.getMyFId();
    p.karmaPoints = 0 ;
    p.name = this.name;
    p.rollNo = this.email.slice(0, 8);
    p.phone = this.phone;


    this.firebaseService.SaveEmailPasswordPhone(this.email, this.password, this.phone).then( _ => {

      this.firebaseService.createNewProfile(p.fId, p).then( _ => {
        this.authservice.updateBAsicProfileDetails(this.image, this.name).then( _ => {
          this.authservice.sendVerificationMail(this.email).then( _ => {

            this.router.navigate(['/home']);
          });

        });
      });
    });


  });
}



subscribeToPush() {

  let convertedVapidKey = this.pushService.urlBase64ToUint8Array(environment.vapiKey);

  navigator['serviceWorker']
    .getRegistration('../../../app')
    .then(registration => {
      registration.pushManager
        .subscribe({ userVisibleOnly: true, applicationServerKey: convertedVapidKey })
        .then(pushSubscription => {
          console.log(pushSubscription);
          console.log(JSON.parse(JSON.stringify(pushSubscription)));
          console.log(pushSubscription.toJSON());
          console.log(JSON.stringify(pushSubscription));
          console.log(pushSubscription.getKey('p256dh'));
          this.pushService.sendpushSubscriptionObjectToServer(JSON.stringify(pushSubscription), this.authservice.getMyFId(),
          this.getTheOptionForNotificationSubcriptionObjectStorageTag()).then(res => {
            console.log(res)
          });
         // window.open(`https://stackoverflow.com/questions/31328365/how-to-start-http-server-locally`);
          // this.pushService.addSubscriber(pushSubscription)
          //   .subscribe(

          //     res => {
          //       console.log('[App] Add subscriber request answer', res)

          //       let snackBarRef = this.snackBar.open('Now you are subscribed', null, {
          //         duration: this.snackBarDuration
          //       });
          //     },
          //     err => {
          //       console.error('[App] Add subscriber request failed', err)
          //     }

          //   )

        });

    })
    .catch(err => {
      console.error(err);
    })

    try {
      const sub =  this.swPush.requestSubscription({
        serverPublicKey: environment.vapiKey,
      }).then(res => {
        console.log(res);
        this.pushService.sendpushSubscriptionObjectToServer(JSON.stringify(res), this.authservice.getMyFId(),this.getTheOptionForNotificationSubcriptionObjectStorageTag());
        console.log(JSON.stringify(res));
      //  window.open(`https://stackoverflow.com/questions/31328365/how-to-start-http-server-locally`);
      }) ;
      // TODO: Send to server.
    } catch (err) {
      console.error('Could not subscribe due to:', err);
    }
  }
  public getBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }

  isMobile(){
    var isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
    return isMobile;
  }

  getTheOptionForNotificationSubcriptionObjectStorageTag(){
    let s = this.isMobile() ? 'M':'D';
    let s2 = this.getBrowserName();
    return s + s2;
  }

}
