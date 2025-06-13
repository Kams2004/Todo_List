import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Todo, Person, Priority, Label } from '../models/todo.model';
import { TodoService } from '../services/todo.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-todo-modal',
  templateUrl: './todo-modal.component.html',
  styleUrls: ['./todo-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class TodoModalComponent implements OnInit {
  form!: FormGroup;
  filteredPeople!: Observable<Person[]>;
  priorities = Object.values(Priority);
  labels = Object.values(Label);
  isEditMode = false;
  people: Person[] = [];
  errors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private todoService: TodoService,
    public dialogRef: MatDialogRef<TodoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { todo?: Todo; mode: 'add' | 'edit'; people: Person[] }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.people = data.people;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.filteredPeople = this.form.get('person')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterPeople(name) : this.people.slice())
    );

    this.form.get('completed')!.valueChanges.subscribe(completed => {
      const endDateControl = this.form.get('endDate');
      if (completed) {
        endDateControl!.setValue(new Date());
        endDateControl!.disable();
      } else {
        endDateControl!.enable();
      }
    });
  }

private initializeForm(): void {
  // Format dates for the input fields (YYYY-MM-DD)
  const startDate = this.data.todo?.startDate ? this.formatDateForInput(this.data.todo.startDate) : this.formatDateForInput(new Date());
  const endDate = this.data.todo?.endDate ? this.formatDateForInput(this.data.todo.endDate) : null;

  this.form = this.fb.group({
    id: [this.data.todo?.id || null],
    title: [this.data.todo?.title || '', [Validators.required, Validators.minLength(3)]],
    person: [this.data.todo?.person || null, [Validators.required, this.validatePerson.bind(this)]],
    startDate: [startDate, Validators.required],
    endDate: [{
      value: endDate,
      disabled: this.data.todo?.completed || false
    }],
    priority: [this.data.todo?.priority || Priority.Medium, Validators.required],
    labels: [this.data.todo?.labels || []],
    description: [this.data.todo?.description || ''],
    completed: [this.data.todo?.completed || false]
  });

  if (this.data.todo?.completed) {
    this.form.get('endDate')?.disable();
  }
}

//helper method to format dates for input fields
private formatDateForInput(date: Date): string {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}
  private _filterPeople(name: string): Person[] {
    const filterValue = name.toLowerCase();
    return this.people.filter(person =>
      person.name.toLowerCase().includes(filterValue) ||
      person.email.toLowerCase().includes(filterValue)
    );
  }

  displayPerson(person: Person): string {
    return person ? `${person.name} (${person.email})` : '';
  }

  toggleLabel(label: Label): void {
    const currentLabels = this.form.get('labels')?.value || [];
    if (currentLabels.includes(label)) {
      this.form.get('labels')?.setValue(currentLabels.filter((l: Label) => l !== label));
    } else {
      this.form.get('labels')?.setValue([...currentLabels, label]);
    }
  }

  validatePerson(control: FormControl): { [key: string]: any } | null {
    const person = control.value;
    if (person && person.name.trim().length < 3) {
      return { 'invalidName': true };
    }
    if (person && !this.isEmailValid(person.email)) {
      return { 'invalidEmail': true };
    }
    return null;
  }

  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateForm(): boolean {
    this.errors = {};
    const title = this.form.get('title')?.value.trim();
    const person = this.form.get('person')?.value;

    if (!title || title.length < 3) {
      this.errors['title'] = 'Title must be at least 3 characters long.';
    }

    if (!person) {
      this.errors['person'] = 'Assignee is required.';
    } else if (person.name.trim().length < 3) {
      this.errors['person'] = 'Assignee name must be at least 3 characters long.';
    } else if (!this.isEmailValid(person.email)) {
      this.errors['person'] = 'Assignee email is invalid.';
    }

    return Object.keys(this.errors).length === 0;
  }

onSubmit(): void {
  if (this.validateForm()) {
    const formValue = this.form.getRawValue();
    const todo: Todo = {
      id: formValue.id,
      title: formValue.title,
      person: formValue.person,
      startDate: new Date(formValue.startDate),
      endDate: formValue.endDate ? new Date(formValue.endDate) : null,
      priority: formValue.priority,
      labels: formValue.labels,
      description: formValue.description,
      completed: formValue.completed
    };
    this.dialogRef.close(todo);
  } else {
    this.form.markAllAsTouched();
  }
}
}
