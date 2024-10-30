import { supabase } from '@/lib/db';



export async function fetchDeadlineStats() {
    try {
      
      const { data: deadlines, error: deadlinesError } = await supabase
        .from('deadlines')
        .select('id, date');
  
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('deadlineid, submitteddate');
  
      if (deadlinesError) throw deadlinesError;
      if (submissionsError) throw submissionsError;
  
      let metCount = 0;
      let missedCount = 0;
  
      
      const latestSubmissionsMap = new Map<number, Date>();
  
      submissions.forEach((submission) => {
        const submissionDate = new Date(submission.submitteddate);
        const existingDate = latestSubmissionsMap.get(submission.deadlineid);
  
        // If no date exists or if the new date is more recent, update the map
        if (!existingDate || submissionDate > existingDate) {
          latestSubmissionsMap.set(submission.deadlineid, submissionDate);
        }
      });
  
      // Compare each deadline's date with the latest submission date in the map
      deadlines.forEach((deadline) => {
        const deadlineDate = new Date(deadline.date);
        const latestSubmissionDate = latestSubmissionsMap.get(deadline.id);
  
        // If there's a submission date for this deadline, check if it was on time
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