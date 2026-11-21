import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProfilClient from './ProfilClient';

export default async function ProfilPage() {
  await connection();

  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <ProfilClient
      profil={{
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
      }}
    />
  );
}
