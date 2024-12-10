import { supabase } from '@/lib/db';
import { PostgrestError } from '@supabase/supabase-js';
import { getAssignedMod } from './mod';

interface SubmissionData {
  id: string;
  deadlineid: string;
  imageurl: string;
  uuid: string;
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

async function getSecureImageUrl(pathOrUrl: string): Promise<string> {
  try {
    console.log('Getting secure URL for:', pathOrUrl);

    // If it's already just a path (starts with userId/), use it directly
    if (!pathOrUrl.startsWith('http')) {
      console.log('Processing as direct path');
      // Remove 'submissions/' prefix if it exists
      const cleanPath = pathOrUrl.replace(/^submissions\//, '');
      console.log('Clean path:', cleanPath);

      const { data, error } = await supabase.storage
        .from('submissions')
        .createSignedUrl(cleanPath, 3600);

      if (error) {
        console.error('Storage error for direct path:', error);
        throw error;
      }
      return data.signedUrl;
    }

    // Otherwise, extract path from URL
    try {
      console.log('Processing as URL');
      const urlObj = new URL(pathOrUrl);
      const pathParts = urlObj.pathname.split('/');
      console.log('Path parts:', pathParts);

      const submissionsIndex = pathParts.indexOf('submissions');
      if (submissionsIndex === -1) {
        console.error('No submissions folder found in path');
        throw new Error('Invalid storage path');
      }

      const path = pathParts.slice(submissionsIndex + 1).join('/');
      console.log('Extracted path:', path);

      const { data, error } = await supabase.storage
        .from('submissions')
        .createSignedUrl(path, 3600);

      if (error) {
        console.error('Storage error for extracted path:', error);
        throw error;
      }
      return data.signedUrl;
    } catch (error) {
      console.error('URL parsing error:', error);
      throw new SubmissionError(
        'Failed to process submission URL',
        error as DatabaseError
      );
    }
  } catch (error) {
    console.error('Final error in getSecureImageUrl:', error);
    throw new SubmissionError(
      'Failed to generate secure image URL',
      error as DatabaseError
    );
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

    if (!submissionData?.imageurl) {
      return null;
    }

    // Generate signed URL from stored path
    return await getSecureImageUrl(submissionData.imageurl);

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
  storagePath: string
): Promise<SubmissionData> {
  try {
    // Insert new submission with pending status initially
    const { data: newSubmission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        deadlineid: deadlineId,
        imageurl: storagePath,
        uuid: userId,
        status: 'pending',
        submitteddate: new Date().toISOString()
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission creation error:', submissionError);
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
    const assignedMod = await getAssignedMod(userId);

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
  uuid: string;
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
          uuid,
          status,
          submitteddate
        )
      `)
      .eq('uuid', userId)
      .not('lastsubmissionid', 'is', null)
      .order('submission(submitteddate)', { ascending: false })
      .returns<(Omit<DeadlineWithSubmission, 'submission'> & { submission: Submission })[]>();

    if (error) {
      throw new SubmissionError('Failed to fetch unapproved submissions', error);
    }

    // Get signed URLs for all submissions
    const filtered = data?.filter(item => item.submission.status === 'pending');
    const withSignedUrls = await Promise.all(
      filtered.map(async (item) => ({
        ...item,
        submission: {
          ...item.submission,
          imageurl: await getSecureImageUrl(item.submission.imageurl)
        }
      }))
    );

    return withSignedUrls || [];
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

    // Generate signed URL from stored path
    const secureUrl = await getSecureImageUrl(data.imageurl);

    return {
      ...data,
      imageurl: secureUrl
    };
  } catch (error) {
    throw new SubmissionError(
      'Failed to fetch submission',
      error as DatabaseError
    );
  }
}