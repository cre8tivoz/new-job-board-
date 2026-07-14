const https = require('https');

https.get('https://cre8tiv.com.au/works/neo-job-board/', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => { console.log(data); });
}).on("error", (err) => { console.log("Error: " + err.message); });
