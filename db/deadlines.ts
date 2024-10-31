import { supabase } from '@/lib/db';
import { IdeadlineList, Ideadline } from '@/lib/interfaces'

interface AddDeadlineResult {
  success: boolean;
  error?: string;
}


export const getDeadlines = async (userId: string): Promise<IdeadlineList | null> => {
  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('*')
    .eq('userid', userId);
  if (error) {
    console.error('Error fetching deadlines for user:', error);
    return null;
  }

  return { deadlineList: deadlines || null }; 
};


export const getSingleDeadline = async (id: number): Promise<Ideadline | null> => {
    const { data: deadline, error } = await supabase
      .from('deadlines')
      .select(`*`)
      .eq('id', id)
      .single();

    if (error) {
        console.error('Error fetching deadlines:', error);
        return null;
    }
    // console.log(deadline)

    return deadline || null; 
};


export const addDeadline = async (
  userId: string, 
  name: string, 
  description: string, 
  date: Date
): Promise<AddDeadlineResult> => {
    try {
        const { error } = await supabase
            .from('deadlines')
            .insert({
                name,
                description,
                date: date.toISOString(),
                userid: userId,
                lastsubmissionid: null,
            });

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Error adding deadline:', error);
        return {
            success: false,
            error: 'Failed to add deadline. Please try again.',
        };
    }
};