import { Content, Review } from './Course';

export class Profile {
    name: string;
    rollNo: string;
    karmaPoints: number;
    image: string;
    fId: string;
    phone: string;
    myUploads: Content[];
    myReviews: Review[];
    mySkills: MySkills[];
    myPinnedCourses: MyPinnedCourses[];
    myNotifications: MyNotifications[];
    myNewNotificationNumber: number; 
    
    constructor() {
        this.name = '';
        this.rollNo = '';
        this.karmaPoints = 0;
        this.image = '';
        this.fId = '';
        this.phone = '';
        this.myUploads = [];
        this.myReviews = [];
        this.mySkills = [];
        this.myPinnedCourses = [];
        this.myNotifications = [];
        this.myNewNotificationNumber = 0;
    }
}


export class MySkills {
    name: string;
    id: string;
    addedOnDate: number;
    expertiseLevel: string;
    description: string;

    constructor(){
        this.name = '';
        this.id = '';
        this.addedOnDate = 0;
        this.expertiseLevel = 'beginner';
        this.description = '';
        
    }
}


export class SKILLS {
    name: string;
    id: string;
    icon: string;
    students: StudentsInSkills[];
    createdOn: number;
    studentsNo: number;
     /// how hot the skill is? The value should be out of 100,
     // create a dynamic algorithm to update the skill value and make
     // some shit  use of it!
    skillValue: number;  
    constructor(){
        this.name = '';
        this.id = '';
        this.icon = '';
        this.students = [];
        this.createdOn = 0;
        this.studentsNo = 0;
        this.skillValue = 0;
    }
  }

export class StudentsInSkills {
    name: string;
    studentFId: string;
    rollNo: string;
    // This is human unreadble format but allow search query to work properly
    addedOn: number;
    constructor(){
        this.name = '';
        this.rollNo = '';
        this.studentFId = '';
        this.addedOn = 0;
    }
}

export class StudentsInPinnedCourse {
    studentFID: string;
    name: string;
    rollNo: string;
    addedOn: number;
    constructor(){
        this.name = '';
        this.rollNo = '';
        this.studentFID = '';
        this.addedOn = 0;
    }
}

export class MyPinnedCourses {
    name: string;
    id: string;
    pinnedAtDate: string;

     constructor(){
         this.name = '';
         this.id = '';
         this.pinnedAtDate = '';
     }
}

export class MyNotifications {
    heading: string;
    body: string;
    receivedOn: number;
    clickLink: string;

    constructor(){
        this.heading = '';
        this.body = '';
        this.receivedOn = 0;
        this.clickLink = '';
    }
}

