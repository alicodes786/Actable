import { supabase } from '@/lib/db';

export interface ModUser {
  id: number;
  email: string;
  name: string;
  created_at?: string;
}

export async function getAssignedMod(userId: number): Promise<ModUser | null> {
  // First get the relationship
  const { data: relationships, error: relError } = await supabase
    .from('mod_user_relationships')
    .select('mod_id')
    .eq('user_id', userId);

  // If no relationship found or error, return null
  if (relError || !relationships || relationships.length === 0) {
    console.log('No mod relationship found for user:', userId);
    return null;
  }

  // Then get the mod's user details
  const { data: modUser, error: userError } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', relationships[0].mod_id)
    .single();

  if (userError || !modUser) {
    console.error('Error fetching mod user:', userError);
    return null;
  }

  return modUser as ModUser;
}

export async function addModToUser(userId: number, modId: number) {
  const { error } = await supabase
    .from('mod_user_relationships')
    .insert({ user_id: userId, mod_id: modId });

  if (error) {
    console.error('Error adding mod:', error);
    throw error;
  }
}

export async function removeModFromUser(userId: number) {
  const { error } = await supabase
    .from('mod_user_relationships')
    .delete()
    .match({ user_id: userId });

  if (error) {
    console.error('Error removing mod:', error);
    throw error;
  }
}

export async function getAssignedUser(modId: number): Promise<ModUser | null> {
  console.log('Current mod ID (their user.id):', modId);

  // Find the user that this mod is managing
  const { data: relationship, error: relError } = await supabase
    .from('mod_user_relationships')
    .select('user_id')
    .eq('mod_id', modId)  // mod_id is the logged-in mod's user.id
    .single();

  if (relError || !relationship) {
    console.error('Error or no relationship found:', relError);
    return null;
  }

  console.log('Found user_id that mod is managing:', relationship.user_id);

  // Get the managed user's information
  const { data: managedUser, error: userError } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', relationship.user_id)  // Get the managed user's details
    .single();

  if (userError || !managedUser) {
    console.error('Error fetching managed user:', userError);
    return null;
  }

  console.log('Found managed user:', managedUser);
  return managedUser as ModUser;
} 