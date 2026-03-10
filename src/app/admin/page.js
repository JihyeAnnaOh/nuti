import { redirect } from 'next/navigation';

/**
 * Admin index - redirects to the main admin page (feedback dashboard).
 */
export default function AdminPage() {
  redirect('/admin/feedback');
}
