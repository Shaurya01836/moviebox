import CollectionDetailPage from './CollectionDetailClient';

export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function Page() {
  return <CollectionDetailPage />;
}
