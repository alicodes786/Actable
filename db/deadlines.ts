import { supabase } from '@/lib/db';
import { IdeadlineList, Ideadline } from '@/lib/interfaces'

export const getDeadlines = async (): Promise<IdeadlineList | null> => {
  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('*');

  if (error) {
    console.error('Error fetching deadlines:', error);
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