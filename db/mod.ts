import { supabase } from '@/lib/db';

export interface ModUser {
  id: string;
  name: string;
  role: 'user' | 'mod' | 'admin';
  created_at?: string;
}

export async function getAssignedMod(uuid: string): Promise<ModUser | null> {
  // First get the relationship
  const { data: relationships, error: relError } = await supabase
    .from('mod_user_relationships')
    .select('mod_uuid')
    .eq('uuid', uuid);

  // If no relationship found or error, return null
  if (relError || !relationships || relationships.length === 0) {
    console.log('No mod relationship found for user:', uuid);
    return null;
  }

  // Then get the mod's user details
  const { data: modUser, error: userError } = await supabase
    .from('user_profiles')
    .select('id, email, name, role')
    .eq('uuid', relationships[0].mod_uuid)
    .single();

  if (userError || !modUser) {
    console.error('Error fetching mod user:', userError);
    return null;
  }

  return modUser as ModUser;
}

export async function addModToUser(uuid: string, modUuid: string) {
  const { error } = await supabase
    .from('mod_user_relationships')
    .insert({ uuid, mod_uuid: modUuid });

  if (error) {
    console.error('Error adding mod:', error);
    throw error;
  }
}

export async function removeModFromUser(uuid: string) {
  const { error } = await supabase
    .from('mod_user_relationships')
    .delete()
    .match({ uuid });

  if (error) {
    console.error('Error removing mod:', error);
    throw error;
  }
}

export async function getAssignedUser(modUuid: string): Promise<ModUser | null> {
  console.log('Current mod UUID:', modUuid);

  // Find the user that this mod is managing
  const { data: relationship, error: relError } = await supabase
    .from('mod_user_relationships')
    .select('user_uuid')
    .eq('mod_uuid', modUuid)
    .single();

  if (relError || !relationship) {
    console.error('Error or no relationship found:', relError);
    return null;
  }

  console.log('Found user UUID that mod is managing:', relationship.user_uuid);

  // Get the managed user's information
  const { data: managedUser, error: userError } = await supabase
    .from('user_profiles')
    .select('id, name, role')
    .eq('id', relationship.user_uuid)
    .single();

  if (userError || !managedUser) {
    console.error('Error fetching managed user:', userError);
    return null;
  }

  console.log('Found managed user:', managedUser);
  return managedUser as ModUser;
} 