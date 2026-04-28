import {use} from 'react';
import dynamic from 'next/dynamic';
import type {Metadata} from 'next';

import {getMd5FromSlug} from '@/app/getMd5FromSlug';
import {searchAdvanced} from '@/lib/search-encore';

/*
Pretty much all of the code that powers this page
is copied from liquid's work!
*/

const ClientPage = dynamic(() => import('./ClientPage'));

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const md5 = getMd5FromSlug(slug);
  if (!md5) return {title: 'Invalid chart'};

  const response = await searchAdvanced({hash: md5});
  const chart = response.data[0];
  if (!chart) return {title: 'Chart not found'};

  const title = `${chart.name} by ${chart.artist} — Drum Sheet Music`;
  const description = `View the drum chart for ${chart.name} by ${chart.artist} (charted by ${chart.charter}) as sheet music, with synced audio.`;

  // The og + twitter images are picked up automatically from the
  // sibling opengraph-image.tsx (per-chart album-art card). We only
  // need title + description here.
  return {title, description};
}

export default function Page({params}: {params: Promise<{slug: string}>}) {
  const {slug: slugParam} = use(params);
  const slug = getMd5FromSlug(slugParam);

  if (!slug) {
    return 'Invalid chart';
  }

  return <ClientPage md5={slug} />;
}
