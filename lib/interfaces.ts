interface Submission {
  id: number;
  submitteddate: string;
  status: 'pending' | 'approved' | 'invalid';
}

export interface Ideadline {
  id: number;
  name: string;
  description: string;
  date: string;
  userid: string;
  completed: boolean;
  submissions?: Submission[];
  lastsubmissionid: boolean;
}
  
export interface IdeadlineList {
  deadlineList: Ideadline[];
}

export interface IUser {
  id: number; // Unique identifier for the user
  name: string; // Full name of the user
 
}