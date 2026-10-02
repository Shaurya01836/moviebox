fetch('https://vidy.st/anime/70998/1').then(r => r.text()).then(t => console.log(t.substring(t.length - 2000, t.length))).catch(console.error);
