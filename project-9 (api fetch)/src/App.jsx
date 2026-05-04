import { useEffect, useState } from 'react';
import axios from 'axios';
import UsersList from './components/UsersList/UsersList';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        'https://api.freeapi.app/api/v1/public/randomusers',
      );

      // IMPORTANT: actual data path
      setUsers(res.data.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <UsersList users={users} loading={loading} />
    </div>
  );
}

export default App;
