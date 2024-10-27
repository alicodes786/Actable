import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/db';

interface UploadImageParams {
  uri: string;
  userId: string;
  deadlineId: string;
}

interface UploadResponse {
  publicUrl: string;
  error: Error | null;
}

export const uploadSubmissionImage = async ({
  uri,
  userId,
  deadlineId,
}: UploadImageParams): Promise<UploadResponse> => {
  try {
    console.log('Starting upload process...');
    
    // Validate file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    console.log('File exists:', uri);

    // Read the file contents as base64
    try {
      const fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('File read successfully, length:', fileData.length);

      // Convert base64 to Uint8Array
      const binaryData = base64ToUint8Array(fileData);
      console.log('Converted to binary data, length:', binaryData.length);

      // Generate unique file path
      const fileName = `submission-${Date.now()}.jpg`;
      const filePath = `${userId}/${deadlineId}/${fileName}`;
      console.log('Generated file path:', filePath);

      // Upload to Supabase Storage
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, binaryData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', storageData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      // Create submission record
      const { error: dbError } = await supabase
        .from('submissions')
        .insert({
          deadlineid: deadlineId,
          imageurl: publicUrl,
          userid: userId,
          isapproved: false,
          submitteddate: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      console.log('Database record created successfully');

      return { publicUrl, error: null };
    } catch (readError) {
      console.error('Error reading file:', readError);
      throw readError;
    }
  } catch (error) {
    console.error('Error in uploadSubmissionImage:', error);
    return {
      publicUrl: '',
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};

// Helper function to convert base64 to Uint8Array
function base64ToUint8Array(base64String: string): Uint8Array {
  const binaryString = atob(base64String);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}