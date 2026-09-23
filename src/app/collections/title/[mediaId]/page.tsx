import PersonalMediaDetail from './PersonalMediaDetailClient';

export async function generateStaticParams() {
  return [{ mediaId: 'default' }];
}

export default function Page() {
  return <PersonalMediaDetail />;
}
