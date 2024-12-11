import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/db';
import { StorageError } from '@supabase/storage-js';
import { PostgrestError } from '@supabase/supabase-js';

interface UploadImageParams {
  uri: string;
  userId: string;
  deadlineId: string;
}

interface UploadResult {
  publicUrl: string;
  error: Error | null;
}

interface RateLimitCheck {
  allowed: boolean;
  remainingTime?: number;
}

// Custom error classes for different types of failures
export class FileSystemError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class StorageUploadError extends Error {
  constructor(message: string, public originalError?: StorageError) {
    super(message);
    this.name = 'StorageUploadError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: PostgrestError) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Helper function to convert base64 to Uint8Array
function base64ToUint8Array(base64String: string): Uint8Array {
  try {
    const binaryString = atob(base64String);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  } catch (error) {
    throw new FileSystemError(
      'Failed to convert base64 to binary data',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

async function validateFileSize(uri: string): Promise<boolean> {
  const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
  // Limit file size to 5MB
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  return 'size' in fileInfo ? fileInfo.size <= MAX_FILE_SIZE : false;
}

async function checkUploadRateLimit(userId: string): Promise<RateLimitCheck> {
  const RATE_LIMIT_WINDOW = 1000 * 60 * 60; // 1 hour
  const MAX_UPLOADS_PER_WINDOW = 10;

  try {
    // Record this attempt first
    const { error: insertError } = await supabase
      .from('upload_attempts')
      .insert({
        user_id: userId,
        success: false // Will be updated to true if upload succeeds
      });

    if (insertError) throw insertError;

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

    // Check recent attempts (both successful and failed)
    const { data: recentAttempts, error } = await supabase
      .from('upload_attempts')
      .select('attempted_at')
      .eq('user_id', userId)
      .gte('attempted_at', windowStart)
      .order('attempted_at', { ascending: false });

    if (error) throw error;

    if (!recentAttempts || recentAttempts.length < MAX_UPLOADS_PER_WINDOW) {
      return { allowed: true };
    }

    // If rate limited, calculate remaining time
    const oldestAttempt = new Date(recentAttempts[recentAttempts.length - 1].attempted_at);
    const resetTime = new Date(oldestAttempt.getTime() + RATE_LIMIT_WINDOW);
    const remainingTime = resetTime.getTime() - Date.now();

    return {
      allowed: false,
      remainingTime: Math.ceil(remainingTime / 1000 / 60) // Convert to minutes
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // If check fails, allow upload to proceed
    return { allowed: true };
  }
}

export const uploadSubmissionImage = async ({
  uri,
  userId,
  deadlineId,
}: UploadImageParams): Promise<UploadResult> => {
  try {
    // Check rate limit first
    const rateLimit = await checkUploadRateLimit(userId);
    if (!rateLimit.allowed) {
      return {
        publicUrl: '',
        error: new Error(
          `Upload attempt limit exceeded. Please try again in ${rateLimit.remainingTime} minutes.`
        )
      };
    }

    // First verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      console.error('Authentication error:', authError);
      return {
        publicUrl: '',
        error: new Error(authError?.message || 'User not authenticated')
      };
    }

    // Validate file exists and size
    const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
    if (!fileInfo.exists) {
      console.error('File does not exist:', uri);
      return {
        publicUrl: '',
        error: new FileSystemError('File does not exist')
      };
    }

    const isValidSize = await validateFileSize(uri);
    if (!isValidSize) {
      console.error('File size exceeds limit');
      return {
        publicUrl: '',
        error: new FileSystemError('File size exceeds 5MB limit')
      };
    }

    // Step 2: Read the file contents
    let fileData: string;
    try {
      fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (error) {
      console.error('File read error:', error);
      return {
        publicUrl: '',
        error: new FileSystemError(
          'Failed to read file',
          error instanceof Error ? error : new Error(String(error))
        )
      };
    }

    // Step 3: Convert to binary
    let binaryData: Uint8Array;
    try {
      binaryData = base64ToUint8Array(fileData);
    } catch (error) {
      console.error('Binary conversion error:', error);
      return {
        publicUrl: '',
        error: new FileSystemError(
          'Failed to process file data',
          error instanceof Error ? error : new Error(String(error))
        )
      };
    }

    // Step 4: Generate unique file path with authenticated user ID
    const fileName = `submission-${Date.now()}.jpg`;
    const filePath = `${session.user.id}/${deadlineId}/${fileName}`;

    console.log('Attempting upload with path:', filePath);
    console.log('Current user ID:', session.user.id);

    // Step 5: Upload to Supabase Storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, binaryData, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', {
        message: uploadError.message,
        name: uploadError.name,
        cause: uploadError.cause
      });
      return {
        publicUrl: '',
        error: new StorageUploadError(
          `Failed to upload file to storage: ${uploadError.message}`,
          uploadError
        )
      };
    }

    // If upload succeeds, update the attempt record
    const { error: updateError } = await supabase
      .from('upload_attempts')
      .update({ success: true })
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error('Failed to update upload attempt:', updateError);
    }

    return {
      publicUrl: filePath,
      error: null
    };

  } catch (error) {
    console.error('Unexpected error in uploadSubmissionImage:', error);
    return {
      publicUrl: '',
      error: error instanceof Error ? error : new Error('Unknown error occurred during upload')
    };
  }
};