export enum Priority {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard'
}

export enum Label {
  HTML = 'HTML',
  CSS = 'CSS',
  NodeJS = 'Node.js',
  jQuery = 'jQuery'
}

export interface Person {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface Todo {
  id: number;
  title: string;
  person: Person;
  startDate: Date;
  endDate: Date | null;
  priority: Priority;
  labels: Label[];
  description: string;
  completed: boolean;
}