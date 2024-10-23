export interface Ideadline {
  id: number;
  name: string;
  date: Date;
  description: string;
  lastsubmissionid: number | null;
  userid: number;
}
  
export interface IdeadlineList {
  deadlineList: Ideadline[];
}