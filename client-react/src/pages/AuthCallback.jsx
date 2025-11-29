

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, fetchUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    const completeAuth = async () => {
      if (error) {
        console.error('OAuth error:', error);
        setLoading(false);
        navigate('/login?error=' + error);
        return;
      }

      if (token) {
        localStorage.setItem('token', token);
        if (setToken) setToken(token);
        if (fetchUser) {
          try {
            await fetchUser();
          } catch (e) {
            // ignore
          }
        }
        setLoading(false);
        window.location.href = '/dashboard';
      } else {
        setLoading(false);
        navigate('/login?error=no-token');
      }
    };

    completeAuth();
    // eslint-disable-next-line
  }, [searchParams, navigate, setToken, fetchUser]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="loading-spinner"></div>
      <p style={{ marginLeft: '1rem' }}>{loading ? 'Completing sign in...' : 'Redirecting...'}</p>
    </div>
  );
};

export default AuthCallback;
