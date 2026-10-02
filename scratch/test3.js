fetch('https://aniembed.se/e/98203/1?lang=sub&autoplay=1').then(r => r.text()).then(t => console.log(t.includes("Couldn't load the player"))).catch(console.error);
