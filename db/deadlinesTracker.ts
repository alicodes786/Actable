import { supabase } from '@/lib/db';

export async function fetchDeadlineStats(uuid: string) {
    try {
      const { data: deadlines, error: deadlinesError } = await supabase
        .from('deadlines')
        .select('id, date')
        .eq('uuid', uuid);
  
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('deadlineid, submitteddate')
        .eq('uuid', uuid);
  
      if (deadlinesError) throw deadlinesError;
      if (submissionsError) throw submissionsError;
  
      let metCount = 0;
      let missedCount = 0;
  
      const latestSubmissionsMap = new Map<number, Date>();
  
      submissions.forEach((submission) => {
        const submissionDate = new Date(submission.submitteddate);
        const existingDate = latestSubmissionsMap.get(submission.deadlineid);
  
        if (!existingDate || submissionDate > existingDate) {
          latestSubmissionsMap.set(submission.deadlineid, submissionDate);
        }
      });
  
      deadlines.forEach((deadline) => {
        const deadlineDate = new Date(deadline.date);
        const latestSubmissionDate = latestSubmissionsMap.get(deadline.id);
  
        if (latestSubmissionDate) {
          if (latestSubmissionDate <= deadlineDate) {
            metCount++;
          } else {
            missedCount++;
          }
        }
      });
  
      return { metCount, missedCount };
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
      return { metCount: 0, missedCount: 0 };
    }
  }