import { useEffect } from 'react';
import { getUsers } from '../services/users.service';

export default function UsersTest() {
  useEffect(() => {
    getUsers()
      .then((res) => {
        console.log('USERS:', res);
      })
      .catch((err) => {
        console.error('ERROR USERS:', err);
      });
  }, []);

  return <div>Users test (mirá la consola)</div>;
}
