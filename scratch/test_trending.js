const getTrending = async () => {
  const url1 = 'https://api.themoviedb.org/3/discover/tv?api_key=62513680a70453f584b71ef5945ccc61&with_original_language=ja&with_genres=16&sort_by=popularity.desc&vote_count.gte=100';
  const url2 = 'https://api.themoviedb.org/3/trending/tv/week?api_key=62513680a70453f584b71ef5945ccc61';
  
  const res1 = await fetch(url1).then(r => r.json());
  console.log("Discover (popularity + vote_count >= 100):");
  console.log(res1.results.slice(0, 5).map(r => r.name));

  const res2 = await fetch(url2).then(r => r.json());
  console.log("\nTrending TV Week (filtered for ja & 16):");
  console.log(res2.results.filter(r => r.original_language === 'ja' && r.genre_ids.includes(16)).slice(0, 5).map(r => r.name));
};

getTrending();
