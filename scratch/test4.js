fetch('https://aniembed.se/e/98203/1?lang=sub&autoplay=1').then(r => console.log(Object.fromEntries(r.headers.entries()))).catch(console.error);
