import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Knight &amp; Wizard CMS</h1>
      <p>Living-rules administration for catalogues, bestiary, spells and nations.</p>
      <Link href="/admin">Open admin</Link>
    </main>
  );
}
