import { Component } from '@angular/core';
import { TodoListComponent } from './todo-list/todo-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  template: '<app-todo-list></app-todo-list>',
  standalone: true,
  imports: [CommonModule, TodoListComponent]
})
export class AppComponent {}