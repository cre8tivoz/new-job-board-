#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const scanHistory = process.argv.includes('--history');
const maximumFileSize = 2 * 1024 * 1024;
const excludedPaths = new Set([
  'package-lock.json',
  'scripts/security/scan-secrets.mjs',
]);

const strongPatterns = [
  ['Google API key', /AIza[0-9A-Za-z_-]{30,}/g],
  ['GitHub token', /gh[pousr]_[0-9A-Za-z]{20,}/g],
  ['AWS access key', /AKIA[0-9A-Z]{16}/g],
  ['Stripe secret key', /sk_(?:live|test)_[0-9A-Za-z]{16,}/g],
  ['Slack token', /xox[baprs]-[0-9A-Za-z-]{20,}/g],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['JSON Web Token', /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
];

const assignmentPatterns = [
  /["']?(?:API[_-]?KEY|SECRET|TOKEN|PASSWORD|PRIVATE[_-]?KEY)["']?\s*[=:]\s*["']([^"']{16,})["']/gi,
  /^(?:API[_-]?KEY|SECRET|TOKEN|PASSWORD|PRIVATE[_-]?KEY)=([^\s#]{16,})$/gmi,
];
const absoluteUrlPattern = /https?:\/\/[^\s"'<>`]+/g;

function git(args, options = {}) {
  return execFileSync('git', args, {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function isPlaceholder(value) {
  return /replace|placeholder|example|dummy|your[_-]|xxxx|not[_-]?set|\$\{|<[^>]+>/i.test(value);
}

function entropy(value) {
  const frequencies = new Map();
  for (const character of value) {
    frequencies.set(character, (frequencies.get(character) ?? 0) + 1);
  }

  let result = 0;
  for (const count of frequencies.values()) {
    const probability = count / value.length;
    result -= probability * Math.log2(probability);
  }
  return result;
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let position = 0; position < index; position += 1) {
    if (text.charCodeAt(position) === 10) line += 1;
  }
  return line;
}

function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host === '::1' || host.endsWith('.local') || host.endsWith('.internal')) {
    return true;
  }

  const octets = host.split('.').map(Number);
  if (octets.length === 4 && octets.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)) {
    return octets[0] === 10 ||
      octets[0] === 127 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168);
  }

  return host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:');
}

function scanText(path, text, scope) {
  if (excludedPaths.has(path) || text.includes('\u0000')) return [];

  const findings = [];
  for (const [type, pattern] of strongPatterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      findings.push({ scope, path, type, line: lineNumberAt(text, match.index ?? 0) });
    }
  }

  for (const pattern of assignmentPatterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const candidate = match[1];
      if (!isPlaceholder(candidate) && entropy(candidate) >= 3.5) {
        findings.push({
          scope,
          path,
          type: 'High-entropy secret assignment',
          line: lineNumberAt(text, match.index ?? 0),
        });
      }
    }
  }

  absoluteUrlPattern.lastIndex = 0;
  for (const match of text.matchAll(absoluteUrlPattern)) {
    try {
      const parsed = new URL(match[0].replace(/[),.;]+$/, ''));
      const line = lineNumberAt(text, match.index ?? 0);
      if (parsed.username || parsed.password) {
        findings.push({ scope, path, type: 'Credential embedded in URL', line });
      }
      if (isPrivateHostname(parsed.hostname)) {
        findings.push({ scope, path, type: 'Private or internal URL', line });
      }
      for (const [name, value] of parsed.searchParams) {
        if (/(key|secret|token|password|credential|authorization)/i.test(name) &&
            value.length >= 8 && !isPlaceholder(value)) {
          findings.push({ scope, path, type: 'Sensitive URL query parameter', line });
        }
      }
    } catch {
      // Dynamic and intentionally incomplete URL templates are ignored.
    }
  }

  return findings;
}

function currentFiles() {
  const output = git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']);
  return output.split('\u0000').filter(Boolean);
}

function scanCurrentTree() {
  const findings = [];
  for (const path of currentFiles()) {
    try {
      const content = readFileSync(path);
      if (content.length <= maximumFileSize) {
        findings.push(...scanText(path, content.toString('utf8'), 'working tree'));
      }
    } catch {
      // Files removed between enumeration and read are ignored.
    }
  }
  return findings;
}

function scanGitHistory() {
  const findings = [];
  const scannedBlobs = new Set();
  const commits = git(['rev-list', '--reverse', '--all']).trim().split('\n').filter(Boolean);

  for (const commit of commits) {
    const tree = git(['ls-tree', '-r', '-z', commit]);
    for (const entry of tree.split('\u0000').filter(Boolean)) {
      const match = entry.match(/^\d+ blob ([0-9a-f]+)\t(.+)$/s);
      if (!match) continue;
      const [, objectId, path] = match;
      if (scannedBlobs.has(objectId) || excludedPaths.has(path)) continue;
      scannedBlobs.add(objectId);

      const size = Number(git(['cat-file', '-s', objectId]).trim());
      if (!Number.isFinite(size) || size > maximumFileSize) continue;

      const content = git(['cat-file', 'blob', objectId], { encoding: 'buffer' });
      const text = Buffer.isBuffer(content) ? content.toString('utf8') : String(content);
      findings.push(...scanText(path, text, `history ${commit.slice(0, 12)}`));
    }
  }

  return findings;
}

const findings = scanHistory ? scanGitHistory() : scanCurrentTree();
const uniqueFindings = [...new Map(
  findings.map((finding) => [
    `${finding.scope}:${finding.path}:${finding.line}:${finding.type}`,
    finding,
  ]),
).values()];

if (uniqueFindings.length > 0) {
  console.error(`Secret scan failed with ${uniqueFindings.length} finding(s). Values are intentionally suppressed.`);
  for (const finding of uniqueFindings) {
    console.error(`${finding.scope}: ${finding.type} at ${finding.path}:${finding.line}`);
  }
  process.exitCode = 1;
} else {
  console.log(`${scanHistory ? 'Git history' : 'Working tree'} secret scan passed.`);
}
