import { supabase } from '@/lib/db';

export interface ModUser {
  id: string;
  name: string;
  role: 'user' | 'mod' | 'admin';
  email?: string;
  created_at?: string;
}

export async function getAssignedMod(uuid: string): Promise<ModUser | null> {
  // First get the relationship
  const { data: relationships, error: relError } = await supabase
    .from('mod_user_relationships')
    .select('mod_uuid')
    .eq('user_uuid', uuid);

  // If no relationship found or error, return null
  if (relError || !relationships || relationships.length === 0) {
    console.log('No mod relationship found for user:', uuid);
    return null;
  }

  // Get the mod's user details
  const { data: modUser, error: userError } = await supabase
    .from('user_profiles')
    .select('id, name, role')
    .eq('id', relationships[0].mod_uuid)
    .single();

  if (userError || !modUser) {
    console.error('Error fetching mod user:', userError);
    return null;
  }

  // Get the mod's email using the secure RPC
  const { data: emailData, error: emailError } = await supabase
    .rpc('get_user_email', {
      user_id: relationships[0].mod_uuid
    });

  if (emailError) {
    console.error('Error fetching mod email:', emailError);
    return null;
  }

  return {
    ...modUser,
    email: emailData
  } as ModUser;
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
    .match({ user_uuid: uuid });

  if (error) {
    console.error('Error removing mod:', error);
    throw error;
  }
}

export async function getAssignedUser(modUuid: string): Promise<ModUser | null> {
  try {
    // Find the user that this mod is managing
    const { data: relationship, error: relError } = await supabase
      .from('mod_user_relationships')
      .select('user_uuid')
      .eq('mod_uuid', modUuid)
      .single();

    if (relError || !relationship) {
      console.log('No active mod relationship found for:', modUuid);
      return null;
    }

    // Get the managed user's information
    const { data: managedUser, error: userError } = await supabase
      .from('user_profiles')
      .select('id, name, role')
      .eq('id', relationship.user_uuid)
      .single();

    if (userError || !managedUser) {
      console.log('No user found for relationship:', relationship.user_uuid);
      return null;
    }

    return managedUser as ModUser;
  } catch (error) {
    console.error('Error in getAssignedUser:', error);
    return null;
  }
} 