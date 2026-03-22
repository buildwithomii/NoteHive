import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/');
        return;
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.data()?.role;
      
      if (role !== 'admin') {
        navigate('/');
      }
    };
    
    checkAdmin();
  }, [user, navigate]);

  return (
    <div className="p-8">
      <h1>Admin Panel</h1>
    </div>
  );
}

