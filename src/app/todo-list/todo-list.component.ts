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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
// import { TranslateService } from '@ngx-translate/core';

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
  selectedPriorities: Priority[] = [];
  selectedLabels: Label[] = [];
  priorities = Object.values(Priority);
  labels = Object.values(Label);
  isPriorityDropdownOpen: boolean = false;
  isLabelDropdownOpen: boolean = false;


 currentLang: 'en' | 'fr' = 'en';
languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' }
];


  constructor(
    private todoService: TodoService,
    private dialog: MatDialog,
  // private translate: TranslateService
  ) {  
  //   this.translate.setDefaultLang('en');
  // this.translate.use('en');
}



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

 exportToExcel(): void {
  // Use selected tasks if any, otherwise use current page tasks
  const tasksToExport = this.selectedTasks.length > 0 
    ? this.filteredTodos.filter(task => this.selectedTasks.includes(task.id))
    : this.currentTasks;

  const excelData = tasksToExport.map(task => ({
    'Task Title': task.title,
    'Assignee': task.person.name,
    'Priority': task.priority,
    'Labels': task.labels.join(', '),
    'Start Date': this.formatDate(task.startDate),
    'End Date': task.endDate ? this.formatDate(task.endDate) : 'N/A',
    'Status': task.completed ? 'Completed' : 'Pending',
    'Description': task.description
  }));


  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  XLSX.writeFile(workbook, 'Tasks_Export.xlsx', { compression: true });
}



   exportToPDF(): void {
  // Use selected tasks if any, otherwise use current page tasks
  const tasksToExport = this.selectedTasks.length > 0 
    ? this.filteredTodos.filter(task => this.selectedTasks.includes(task.id))
    : this.currentTasks;

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Tasks Export', 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  const pdfData = tasksToExport.map(task => [
    task.title,
    task.person.name,
    task.priority,
    task.labels.join(', '),
    this.formatDate(task.startDate),
    task.endDate ? this.formatDate(task.endDate) : 'N/A',
    task.completed ? 'Completed' : 'Pending'
  ]);
  

  autoTable(doc, {
    head: [['Title', 'Assignee', 'Priority', 'Labels', 'Start Date', 'End Date', 'Status']],
    body: pdfData,
    startY: 40,
    styles: {
      cellPadding: 3,
      fontSize: 9,
      valign: 'middle',
      halign: 'left'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 }
    }
  });
  
  doc.save('Tasks_Export.pdf');
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

    if (this.selectedPriorities.length > 0) {
      filtered = filtered.filter(todo =>
        this.selectedPriorities.includes(todo.priority)
      );
    }

    if (this.selectedLabels.length > 0) {
      filtered = filtered.filter(todo =>
        this.selectedLabels.every(label => todo.labels.includes(label))
      );
    }

    switch (this.currentFilter) {
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

  togglePriorityDropdown(): void {
    this.isPriorityDropdownOpen = !this.isPriorityDropdownOpen;
    this.isLabelDropdownOpen = false;
  }

  toggleLabelDropdown(): void {
    this.isLabelDropdownOpen = !this.isLabelDropdownOpen;
    this.isPriorityDropdownOpen = false;
  }

  togglePriority(priority: Priority): void {
    const index = this.selectedPriorities.indexOf(priority);
    if (index === -1) {
      this.selectedPriorities.push(priority);
    } else {
      this.selectedPriorities.splice(index, 1);
    }
    this.filterTodos();
  }

  toggleLabelFilter(label: Label): void {
    const index = this.selectedLabels.indexOf(label);
    if (index === -1) {
      this.selectedLabels.push(label);
    } else {
      this.selectedLabels.splice(index, 1);
    }
    this.filterTodos();
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
