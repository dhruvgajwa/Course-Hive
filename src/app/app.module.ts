import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AuthService} from './services/auth.service';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AuthGaurd} from '../app/Gaurd/auth.gaurd';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon'; 
import { MatMenuModule} from '@angular/material/menu'; 
import {MatRadioModule} from '@angular/material/radio';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { CourseDetailsComponent } from './components/course-details/course-details.component';
import { FirebaseService} from './services/firebase.service';
import { AddACourseComponent } from './components/add-acourse/add-acourse.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { MyprofileComponent } from './components/myprofile/myprofile.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SearchComponent } from './components/search/search.component';
import { SkillSearchComponent } from './components/skill-search/skill-search.component';
import { AddSkillComponent } from './temoraryComponents/add-skill/add-skill.component';
import { SearchStudentByNameComponent } from './temoraryComponents/search-student-by-name/search-student-by-name.component';
import { SearchBySkillComponent } from './temoraryComponents/search-by-skill/search-by-skill.component';
import { SkillDetailsComponent } from './components/skill-details/skill-details.component';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

const appRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'home', component: HomepageComponent, canActivate: [AuthGaurd]},
  {path: 'course/:id', component: CourseDetailsComponent, canActivate: [AuthGaurd] },
  {path: 'addcourse', component: AddACourseComponent, canActivate: [AuthGaurd]},
  { path: 'verifyEmail', component: VerifyEmailComponent, canActivate: [AuthGaurd]  },
  { path: 'skillSearch', component: SkillSearchComponent, canActivate: [AuthGaurd]  },
  { path: 'myprofile', component: MyprofileComponent, canActivate: [AuthGaurd] },
  { path: 'searchStudent', component: SearchStudentByNameComponent, canActivate: [AuthGaurd] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGaurd] },
  { path: 'skill/:id', component: SkillDetailsComponent, canActivate: [AuthGaurd] },
  { path: 'addNewSkill', component: AddSkillComponent, canActivate: [AuthGaurd] }
];


@NgModule({
  declarations: [
    
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomepageComponent,
    CourseDetailsComponent,

    AddACourseComponent,
    VerifyEmailComponent,
    MyprofileComponent,
    FooterComponent,
    ProfileComponent,
    SearchComponent,
    SkillSearchComponent,
    AddSkillComponent,
    SearchStudentByNameComponent,
    SearchBySkillComponent,
    SkillDetailsComponent
  ],
  imports: [BrowserAnimationsModule,
    NgbModule,
    MatTabsModule,
    MatInputModule,
    LoadingBarModule,
    AngularFireAuthModule,
    MatRadioModule,
    AngularFireDatabaseModule,
    MatMenuModule,
    AngularFirestoreModule,
    MatAutocompleteModule,
    MatIconModule,
    AngularFireStorageModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    FormsModule,
    RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'enabled', onSameUrlNavigation: 'reload' }),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    RouterModule,
  ],
  providers: [
     AuthService,
      AuthGaurd,
      FirebaseService
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
