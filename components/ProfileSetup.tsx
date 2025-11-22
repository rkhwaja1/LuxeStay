import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';
import { updateUserAttributes } from 'aws-amplify/auth';

interface ProfileSetupProps {
  isOpen: boolean;
  onComplete: (bio: string, avatar: string) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ isOpen, onComplete }) => {
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to S3 Storage and get a URL
      // For this demo, we are using a local blob URL, which won't persist across sessions perfectly
      // unless we use the S3 integration.
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAvatar(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Attempt to save to Cognito attributes
        await updateUserAttributes({
            userAttributes: {
                'custom:bio': bio,
                // 'picture': avatar // Cannot easily save blob URL to cognito standard attribute without S3
            }
        });
        onComplete(bio, avatar);
    } catch (e) {
        console.error("Failed to update profile attributes", e);
        // Still complete locally to unblock user
        onComplete(bio, avatar);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 text-center border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Add a photo and bio to personalize your experience</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
             
             <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 mb-3 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group hover:border-rose-500 transition-colors cursor-pointer">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <User size={32} className="text-gray-400" />
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                    </div>
                </div>
                <span className="text-sm font-medium text-rose-500 cursor-pointer">Upload Photo</span>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition resize-none"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                ></textarea>
             </div>

             <button disabled={loading} type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all">
                {loading ? 'Saving...' : 'Finish Setup'}
             </button>
          </form>
       </div>
    </div>
  );
};

export default ProfileSetup;