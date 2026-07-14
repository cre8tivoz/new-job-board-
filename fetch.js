import fs from 'fs';
async function run() {
  const res = await fetch('https://cre8tiv.com.au/works/neo-job-board/');
  const text = await res.text();
  fs.writeFileSync('neo.html', text);
}
run();
