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

export interface IUser {
  id: number; // Unique identifier for the user
  name: string; // Full name of the user
 
}