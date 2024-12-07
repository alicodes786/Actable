import { supabase } from '@/lib/db';
import { PostgrestError } from '@supabase/supabase-js';
import { getAssignedMod } from './mod';

interface SubmissionData {
  id: string;
  deadlineid: string;
  imageurl: string;
  userid: string;
  status: 'pending' | 'approved' | 'invalid';
  submitteddate: string;
}

interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}

export class SubmissionError extends Error {
  constructor(message: string, public originalError?: DatabaseError | PostgrestError) {
    super(message);
    this.name = 'SubmissionError';
  }
}

export async function fetchLastSubmissionImage(deadlineId: string): Promise<string | null> {
  try {
    // First fetch the last submission ID from the deadline
    const { data: deadlineData, error: deadlineError } = await supabase
      .from('deadlines')
      .select('lastsubmissionid')
      .eq('id', deadlineId)
      .single();

    if (deadlineError) {
      throw new SubmissionError(
        'Failed to fetch deadline data',
        deadlineError
      );
    }

    if (!deadlineData?.lastsubmissionid) {
      return null;
    }

    // Then fetch the submission details
    const { data: submissionData, error: submissionError } = await supabase
      .from('submissions')
      .select('imageurl')
      .eq('id', deadlineData.lastsubmissionid)
      .single();

    if (submissionError) {
      throw new SubmissionError(
        'Failed to fetch submission data',
        submissionError
      );
    }

    return submissionData?.imageurl || null;

  } catch (error) {
    if (error instanceof SubmissionError) {
      throw error;
    }
    throw new SubmissionError(
      'Unexpected error fetching last submission',
      error as DatabaseError
    );
  }
}

export async function createNewSubmission(
  deadlineId: string,
  userId: string,
  imageUrl: string
): Promise<SubmissionData> {
  try {
    // Insert new submission with pending status initially
    const { data: newSubmission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        deadlineid: deadlineId,
        imageurl: imageUrl,
        userid: userId,
        status: 'pending',
        submitteddate: new Date().toISOString()
      })
      .select()
      .single();

    if (submissionError) {
      throw new SubmissionError(
        'Failed to create new submission',
        submissionError
      );
    }

    if (!newSubmission) {
      throw new SubmissionError('No submission data returned after creation');
    }

    // Update deadline with new submission ID
    const { error: updateError } = await supabase
      .from('deadlines')
      .update({ lastsubmissionid: newSubmission.id })
      .eq('id', deadlineId);

    if (updateError) {
      throw new SubmissionError(
        'Failed to update deadline with new submission',
        updateError
      );
    }

    // Check if user has an assigned mod and auto-approve if not
    await handleSubmissionApproval(newSubmission.id, userId, deadlineId);

    return newSubmission;

  } catch (error) {
    if (error instanceof SubmissionError) {
      throw error;
    }
    throw new SubmissionError(
      'Unexpected error creating submission',
      error as DatabaseError
    );
  }
}

async function handleSubmissionApproval(
  submissionId: string,
  userId: string,
  deadlineId: string
): Promise<void> {
  try {
    const assignedMod = await getAssignedMod(Number(userId));
    
    // If no mod is assigned, auto-approve the submission
    if (assignedMod === null) {
      const { error: approvalError } = await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', submissionId);

      if (approvalError) {
        throw new SubmissionError('Failed to auto-approve submission', approvalError);
      }

      // Update deadline completion status
      const { error: completionError } = await supabase
        .from('deadlines')
        .update({ completed: true })
        .eq('id', deadlineId);

      if (completionError) {
        throw new SubmissionError('Failed to update deadline completion status', completionError);
      }
    }
  } catch (error) {
    throw new SubmissionError(
      'Error handling submission approval',
      error as DatabaseError
    );
  }
}

export interface Submission {
  id: number;
  deadlineid: number;
  imageurl: string;
  userid: string;
  // Status can be pending, approved, or invalid
  status: 'pending' | 'approved' | 'invalid';
  submitteddate: string;
}

export interface DeadlineWithSubmission {
  id: number;
  name: string;
  description: string;
  date: string;
  lastsubmissionid: number;
  submission: Submission;
}

export async function fetchUnapprovedSubmissions(userId: string): Promise<DeadlineWithSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('deadlines')
      .select(`
        id,
        name,
        description,
        date,
        lastsubmissionid,
        submission:submissions!deadlines_lastsubmissionid_fkey (
          id,
          deadlineid,
          imageurl,
          userid,
          status,
          submitteddate
        )
      `)
      .eq('userid', userId)
      .not('lastsubmissionid', 'is', null)
      .order('submission(submitteddate)', { ascending: false })
      .returns<(Omit<DeadlineWithSubmission, 'submission'> & { submission: Submission })[]>();

    if (error) {
      throw new SubmissionError('Failed to fetch unapproved submissions', error);
    }

    const filtered = data?.filter(item => item.submission.status === 'pending');
    
    return filtered || [];
  } catch (error) {
    throw new SubmissionError(
      'Unexpected error fetching unapproved submissions',
      error as DatabaseError
    );
  }
}

export async function approveSubmission(submissionId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', submissionId);

    if (error) {
      throw new SubmissionError('Failed to approve submission', error);
    }
  } catch (error) {
    throw new SubmissionError(
      'Unexpected error approving submission',
      error as DatabaseError
    );
  }
}

export async function invalidateSubmission(submissionId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'invalid' })
      .eq('id', submissionId);

    if (error) {
      throw new SubmissionError('Failed to invalidate submission', error);
    }
  } catch (error) {
    throw new SubmissionError(
      'Unexpected error invalidating submission',
      error as DatabaseError
    );
  }
}

export async function fetchSubmissionById(submissionId: number): Promise<Submission> {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Submission not found');
    
    return data;
  } catch (error) {
    throw new SubmissionError(
      'Failed to fetch submission',
      error as DatabaseError
    );
  }
}