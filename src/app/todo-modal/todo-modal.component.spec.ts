import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoModalComponent } from './todo-modal.component';

describe('TaskModal', () => {
  let component: TodoModalComponent;
  let fixture: ComponentFixture<TodoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
