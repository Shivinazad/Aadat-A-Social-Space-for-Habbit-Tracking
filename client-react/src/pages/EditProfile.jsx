import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../home.css';

const EditProfile = () => {
  const { user, updateUser, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [bio, setBio] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);

  const avatarOptions = [
    '😊', '😎', '🤓', '🥳', '🤩', 
    '😇', '🤗', '🥰', '😍', '🤪',
    '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎓',
    '👩‍🎓', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍⚕️',
    '👨‍⚕️', '👩‍⚕️', '🧑‍🚀', '👨‍🚀', '👩‍🚀',
    '🦸', '🦹', '🧙', '🧚', '🧛'
  ];

  useEffect(() => {
    if (user) {
      setSelectedAvatar(user.avatar || '👤');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    setAvatarSaved(false);
    try {
      await authAPI.updateProfile({
        avatar: selectedAvatar
      });

      // Refetch user data to update UI everywhere
      await fetchUser();
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 3000);
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    setBioSaved(false);
    try {
      await authAPI.updateProfile({
        bio: bio
      });

      // Refetch user data to update UI everywhere
      await fetchUser();
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 3000);
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Failed to update bio. Please try again.');
    } finally {
      setSavingBio(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="page">
      <Navbar />
      <main className="main-content">
        <div className="profile-container">
          <div className="edit-profile-header">
            <button className="back-button" onClick={handleCancel}>
              ← Back to Profile
            </button>
            <h1>✏️ Edit Profile</h1>
          </div>

          <section className="edit-section">
            <div className="section-header">
              <h2>🎭 Choose Your Avatar</h2>
              <p className="section-description">Select an avatar that represents you</p>
            </div>
            <div className="current-selection">
              <span className="current-label">Current Avatar:</span>
              <span className="current-avatar">{selectedAvatar}</span>
            </div>
            <div className="avatar-grid">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setAvatarSaved(false);
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
            <div className="section-actions">
              <button 
                className="btn-primary" 
                onClick={handleSaveAvatar} 
                disabled={savingAvatar || selectedAvatar === user?.avatar}
              >
                {savingAvatar ? '💾 Saving...' : avatarSaved ? '✓ Saved!' : '💾 Save Avatar'}
              </button>
            </div>
          </section>

          <section className="edit-section">
            <div className="section-header">
              <h2>📝 Your Bio</h2>
              <p className="section-description">Tell the community about yourself (max 150 characters)</p>
            </div>
            <textarea
              className="bio-textarea"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setBioSaved(false);
              }}
              placeholder="Building habits in public. Share your journey, goals, or what motivates you..."
              maxLength={150}
            />
            <div className="char-count">{bio.length}/150 characters</div>
            <div className="section-actions">
              <button 
                className="btn-primary" 
                onClick={handleSaveBio} 
                disabled={savingBio || bio === user?.bio}
              >
                {savingBio ? '💾 Saving...' : bioSaved ? '✓ Saved!' : '💾 Save Bio'}
              </button>
            </div>
          </section>

          <div className="edit-actions-footer">
            <button className="btn-done" onClick={handleCancel}>
              ✓ Done
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
