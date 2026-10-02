const getTrending = async () => {
  const pages = await Promise.all([
    fetch('https://api.themoviedb.org/3/trending/tv/week?api_key=62513680a70453f584b71ef5945ccc61&page=1').then(r => r.json()),
    fetch('https://api.themoviedb.org/3/trending/tv/week?api_key=62513680a70453f584b71ef5945ccc61&page=2').then(r => r.json()),
    fetch('https://api.themoviedb.org/3/trending/tv/week?api_key=62513680a70453f584b71ef5945ccc61&page=3').then(r => r.json()),
    fetch('https://api.themoviedb.org/3/trending/tv/week?api_key=62513680a70453f584b71ef5945ccc61&page=4').then(r => r.json())
  ]);
  
  const allResults = pages.flatMap(p => p.results);
  const anime = allResults.filter(r => r.original_language === 'ja' && r.genre_ids.includes(16));
  
  console.log(`Found ${anime.length} trending anime in top 80 TV shows:`);
  console.log(anime.slice(0, 10).map(r => r.name));
};
getTrending();
