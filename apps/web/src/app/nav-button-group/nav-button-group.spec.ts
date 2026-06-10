import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavButtonGroup } from './nav-button-group';

describe('NavButtonGroup', () => {
  let component: NavButtonGroup;
  let fixture: ComponentFixture<NavButtonGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavButtonGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(NavButtonGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
