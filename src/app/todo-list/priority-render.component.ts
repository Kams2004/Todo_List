import { Component, Input } from '@angular/core';
import { Priority } from '../models/todo.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-render',
  template: `
    <span [ngClass]="{
      'priority-easy': priority === Priority.Easy,
      'priority-medium': priority === Priority.Medium,
      'priority-hard': priority === Priority.Hard
    }">
      {{ priority }}
    </span>
  `,
  styles: [`
    .priority-easy { color: green; }
    .priority-medium { color: orange; }
    .priority-hard { color: red; }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class PriorityRenderComponent {
  @Input() priority!: Priority;
  Priority = Priority;
}