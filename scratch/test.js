const q = 'query ($search: String) { Media (search: $search, type: ANIME, sort: SEARCH_MATCH) { id title { romaji english } } }';
fetch('https://graphql.anilist.co', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: q, variables: { search: 'SOURYO TO MAJIWARU SHIKIYOKU NO YORU NI...' } })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d))).catch(console.error);
