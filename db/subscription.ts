import { supabase } from '@/lib/db';

export const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("subscribers")
        .select("*")
        .eq("userid", userId)
        .single();
  
      if (error && error.code !== "PGRST116") throw error; // Ignore "no record found" errors
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return { data: null, error };
    }
  };
  
  export const updateSubscription = async (
    id: number,
    email: string
  ) => {
    try {
      const { error } = await supabase
        .from("subscribers")
        .update({ email, isvalidated: false })
        .eq("id", id);
  
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error updating subscription:", error);
      return { success: false, error };
    }
  };
  
  export const createSubscription = async (
    email: string,
    userId: string,
    type: string
  ) => {
    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email, userid: userId, type, isvalidated: false }]);
  
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error creating subscription:", error);
      return { success: false, error };
    }
  };
  
  export const deleteSubscription = async (id: number) => {
    try {
      const { error } = await supabase
        .from("subscribers")
        .delete()
        .eq("id", id);
  
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error deleting subscription:", error);
      return { success: false, error };
    }
  };