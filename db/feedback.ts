import { supabase } from '@/lib/db'; // Adjust the path to your main Supabase client file

/**
 * Submits user feedback to the database.
 * @param feedback - The user's general feedback.
 * @param improvements - Suggestions for improvement.
 * @returns A success object with an optional error message.
 */
export const submitFeedback = async (feedback: string, improvements: string) => {
  try {
    const { error } = await supabase
      .from("feedback")
      .insert([{ feedback, improvements }]);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error submitting feedback:", errorMessage);
    return { success: false, message: errorMessage };
  }
};
