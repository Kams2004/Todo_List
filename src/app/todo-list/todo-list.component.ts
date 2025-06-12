import { Component, OnInit } from '@angular/core';
import { TodoService } from '../services/todo.service';
import { Todo, Priority, Label, Person } from '../models/todo.model';
import { MatDialog } from '@angular/material/dialog';
import { TodoModalComponent } from '../todo-modal/todo-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationModalComponent } from './ConfirmationModalComponent';
import { PriorityRenderComponent } from './priority-render.component'; 


@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    PriorityRenderComponent 
  ]
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  people: Person[] = [];
  searchTerm: string = '';
  currentFilter: string = 'All';
  selectedFilter: string = 'None';
  currentPage: number = 1;
  selectedTasks: number[] = [];
  tasksPerPage: number = 10;

  constructor(
    private todoService: TodoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
      this.filteredTodos = [...todos];
    });
    this.todoService.getPeople().subscribe(people => {
      this.people = people;
    });
  }

  filterTodos(): void {
    let filtered = [...this.todos];
  
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(term) ||
        todo.person.name.toLowerCase().includes(term)
      );
    }
  
    switch (this.currentFilter) {
      case 'Priority':
        filtered = filtered.filter(todo => todo.priority === Priority.Hard);
        break;
      case 'Today':
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(todo =>
          new Date(todo.startDate).toISOString().split('T')[0] === today
        );
        break;
      case 'Completed':
        filtered = filtered.filter(todo => todo.completed);
        break;
    }
  
    this.filteredTodos = filtered;
    this.currentPage = 1;
  }
  

  get totalPages(): number {
    return Math.ceil(this.filteredTodos.length / this.tasksPerPage);
  }

  get currentTasks(): Todo[] {
    const startIndex = (this.currentPage - 1) * this.tasksPerPage;
    const endIndex = startIndex + this.tasksPerPage;
    return this.filteredTodos.slice(startIndex, endIndex);
  }

  getPriorityClass(priority: Priority): string {
    switch (priority) {
      case Priority.Easy: return 'bg-green-100 text-green-800';
      case Priority.Medium: return 'bg-yellow-100 text-yellow-800';
      case Priority.Hard: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getLabelClass(label: Label): string {
    switch (label) {
      case Label.HTML: return 'bg-red-100 text-red-800';
      case Label.CSS: return 'bg-blue-100 text-blue-800';
      case Label.NodeJS: return 'bg-yellow-100 text-yellow-800';
      case Label.jQuery: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  handleFilterChange(filter: string): void {
    this.currentFilter = filter;
    this.filterTodos();
  }



  // Method to calculate the minimum value
  calculateMin(value: number, maxValue: number): number {
    return Math.min(value, maxValue);
  }
  
  handleAddTask(): void {
    const dialogRef = this.dialog.open(TodoModalComponent, {
      width: '600px',
      data: { mode: 'add', people: this.people }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.todoService.addTodo(result).subscribe(() => {
          this.loadData();
        });
      }
    });
  }

  handleEditTask(todo: Todo): void {
    const dialogRef = this.dialog.open(TodoModalComponent, {
      width: '600px',
      data: { mode: 'edit', todo, people: this.people }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.todoService.updateTodo(result).subscribe(() => {
          this.loadData();
        });
      }
    });
  }

  handleDeleteTask(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.todoService.deleteTodo(id).subscribe(() => {
          this.loadData();
        });
      }
    });
  }


  handleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedTasks = this.currentTasks.map(task => task.id);
    } else {
      this.selectedTasks = [];
    }
  }

  handleSelectTask(id: number, event: Event): void {
    event.stopPropagation();
    const index = this.selectedTasks.indexOf(id);
    if (index === -1) {
      this.selectedTasks.push(id);
    } else {
      this.selectedTasks.splice(index, 1);
    }
  }

  handleBulkDelete(): void {
    if (confirm('Are you sure you want to delete selected tasks?')) {
      this.selectedTasks.forEach(id => {
        this.todoService.deleteTodo(id).subscribe(() => {
          this.loadData();
        });
      });
      this.selectedTasks = [];
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
