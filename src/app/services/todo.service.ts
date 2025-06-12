import { Injectable } from '@angular/core';
import { Todo, Person, Priority, Label } from '../models/todo.model';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos: Todo[] = [];
  private people: Person[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    this.people = [
      { 
        id: 1, 
        name: 'John Smith', 
        email: 'john@example.com', 
        phone: '1234567890',
        avatar: 'assets/image_1.jpg'
      },
      { 
        id: 2, 
        name: 'Emily Johnson', 
        email: 'emily@example.com', 
        phone: '0987654321',
        avatar: 'assets/image_1.jpg',
      },
      { 
        id: 3, 
        name: 'Michael Brown', 
        email: 'michael@example.com', 
        phone: '1234567890',
        avatar: 'assets/image_2.jpg'
      },
      { 
        id: 4, 
        name: 'Sarah Wilson', 
        email: 'sarah@example.com', 
        phone: '0987654321',
        avatar: 'assets/image_3.jpg',
      },
      { 
        id: 5, 
        name: 'David Lee', 
        email: 'david@example.com', 
        phone: '1234567890',
        avatar: 'assets/image_4.jpg'
      }
    ];

    this.todos = [
      {
        id: 1,
        title: 'Check the documents of audit',
        person: this.people[0],
        startDate: new Date('2025-06-29'),
        endDate: null,
        priority: Priority.Medium,
        labels: [Label.jQuery],
        description: 'Check audit documents',
        completed: false
      },
      {
        id: 2,
        title: 'Arrange a trip for best performing staff members',
        person: this.people[1],
        startDate: new Date('2025-07-03'),
        endDate: null,
        priority: Priority.Medium,
        labels: [Label.jQuery],
        description: 'Organize staff trip',
        completed: false
      },
      {
        id: 3,
        title: 'Call Adam to check the documentation',
        person: this.people[2],
        startDate: new Date('2025-06-18'),
        endDate: null,
        priority: Priority.Medium,
        labels: [Label.HTML, Label.CSS],
        description: 'Call about documentation',
        completed: false
      },
      {
        id: 4,
        title: 'Call Adam to check the documentation',
        person: this.people[2],
        startDate: new Date('2025-06-30'),
        endDate: null,
        priority: Priority.Medium,
        labels: [Label.HTML, Label.CSS],
        description: 'Follow up call',
        completed: false
      },
      {
        id: 5,
        title: 'Check the documents of audit',
        person: this.people[3],
        startDate: new Date('2025-06-19'),
        endDate: null,
        priority: Priority.Medium,
        labels: [Label.HTML, Label.jQuery],
        description: 'Audit document review',
        completed: false
      },
      {
        id: 6,
        title: 'Check the documents of audit',
        person: this.people[3],
        startDate: new Date('2025-07-09'),
        endDate: null,
        priority: Priority.Medium,
        labels: [Label.HTML, Label.jQuery],
        description: 'Final audit check',
        completed: false
      },
      {
        id: 7,
        title: 'Arrange birthday party for the staff',
        person: this.people[0],
        startDate: new Date('2025-07-02'),
        endDate: null,
        priority: Priority.Medium,
        labels: [],
        description: 'Plan birthday party',
        completed: false
      },
      {
        id: 8,
        title: 'Arrange birthday party for the staff',
        person: this.people[0],
        startDate: new Date('2025-07-06'),
        endDate: null,
        priority: Priority.Medium,
        labels: [],
        description: 'Finalize party details',
        completed: false
      },
      {
        id: 9,
        title: 'Go to marketing section for diwali gifts',
        person: this.people[4],
        startDate: new Date('2025-06-15'),
        endDate: null,
        priority: Priority.Medium,
        labels: [Label.HTML, Label.jQuery],
        description: 'Organize Diwali gifts',
        completed: false
      },
      {
        id: 10,
        title: 'Go to marketing section for diwali gifts',
        person: this.people[4],
        startDate: new Date('2025-06-26'),
        endDate: null,
        priority: Priority.Medium,
        labels: [Label.HTML, Label.jQuery],
        description: 'Distribute Diwali gifts',
        completed: false
      }
    ];
  }

  getTodos(): Observable<Todo[]> {
    return of(this.todos);
  }

  getPeople(): Observable<Person[]> {
    return of(this.people);
  }

  addTodo(todo: Omit<Todo, 'id'>): Observable<Todo> {
    const newTodo = { ...todo, id: this.generateId() };
    this.todos.push(newTodo);
    return of(newTodo);
  }

  updateTodo(updatedTodo: Todo): Observable<Todo> {
    const index = this.todos.findIndex(t => t.id === updatedTodo.id);
    if (index !== -1) {
      this.todos[index] = updatedTodo;
    }
    return of(updatedTodo);
  }

  deleteTodo(id: number): Observable<void> {
    this.todos = this.todos.filter(t => t.id !== id);
    return of(undefined);
  }
  

  private generateId(): number {
    return Math.max(...this.todos.map(t => t.id), 0) + 1;
  }
}