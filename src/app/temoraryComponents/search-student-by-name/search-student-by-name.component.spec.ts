import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchStudentByNameComponent } from './search-student-by-name.component';

describe('SearchStudentByNameComponent', () => {
  let component: SearchStudentByNameComponent;
  let fixture: ComponentFixture<SearchStudentByNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchStudentByNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchStudentByNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
