import { supabase } from '@/lib/db';
import { PostgrestError } from '@supabase/supabase-js';

interface SubmissionImage {
  imageurl: string;
}

interface DeadlineLastSubmission {
  lastsubmissionid: string;
}

interface SubmissionData {
  id: string;
  deadlineid: string;
  imageurl: string;
  userid: string;
  isapproved: boolean;
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
    // Insert new submission
    const { data: newSubmission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        deadlineid: deadlineId,
        imageurl: imageUrl,
        userid: userId,
        isapproved: false,
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