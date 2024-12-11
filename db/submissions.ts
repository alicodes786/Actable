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

export async function getSecureImageUrl(pathOrUrl: string): Promise<string | null> {
  try {
    // If the URL already contains a token, it's already signed
    if (pathOrUrl.includes('?token=')) {
      return pathOrUrl;
    }

    let cleanPath: string;

    // Handle full URLs
    if (pathOrUrl.startsWith('http')) {
      const match = pathOrUrl.match(/submissions\/([^?]+)/);
      if (!match) {
        return null;
      }
      cleanPath = match[1];
    } else {
      cleanPath = pathOrUrl
        .replace(/^submissions\//, '')
        .replace(/^\/+|\/+$/g, '');
    }

    const pathParts = cleanPath.split('/');

    // Silently ignore old format paths
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(pathParts[0])) {
      return null;
    }

    const { data, error } = await supabase.storage
      .from('submissions')
      .createSignedUrl(cleanPath, 3600);

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;

  } catch (error) {
    return null;
  }
}

// Add rate limiting helper
async function checkRateLimit(userId: string): Promise<boolean> {
  const RATE_LIMIT_WINDOW = 1000 * 60 * 60; // 1 hour
  const MAX_SUBMISSIONS_PER_WINDOW = 10;

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('uuid', userId)
    .gte('submitteddate', windowStart);

  return count !== null && count < MAX_SUBMISSIONS_PER_WINDOW;
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
    // Check rate limit first
    const isWithinLimit = await checkRateLimit(userId);
    if (!isWithinLimit) {
      throw new SubmissionError('Rate limit exceeded. Please try again later.');
    }

    // Rest of your existing createNewSubmission code...
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
    const filtered = data?.filter(item => item.submission.status === 'pending') || [];
    const withSignedUrls = await Promise.all(
      filtered.map(async (item) => {
        const signedUrl = await getSecureImageUrl(item.submission.imageurl);
        if (!signedUrl) {
          // Skip this submission if we couldn't get a signed URL
          return null;
        }

        return {
          ...item,
          submission: {
            ...item.submission,
            imageurl: signedUrl
          }
        } satisfies DeadlineWithSubmission;
      })
    );

    // Filter out null entries and explicitly type the result
    return withSignedUrls.filter((item): item is DeadlineWithSubmission => item !== null);
  } catch (error) {
    console.error('Error in fetchUnapprovedSubmissions:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });

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