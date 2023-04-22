declare interface Task {
  id?: string;
  date: Date;
  action: () => void;
}
