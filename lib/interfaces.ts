interface Submission {
  id: number;
  submitteddate: string;
  isapproved: boolean;
}

export interface Ideadline {
  id: number;
  name: string;
  description: string;
  date: string;
  userid: string;
  submissions?: Submission[];
}
  
export interface IdeadlineList {
  deadlineList: Ideadline[];
}

export interface IUser {
  id: number; // Unique identifier for the user
  name: string; // Full name of the user
 
}