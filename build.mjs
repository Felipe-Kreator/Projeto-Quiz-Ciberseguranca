import { cp, mkdir } from 'node:fs/promises';
await mkdir('public', { recursive: true });
await cp('quiz_cyberseguranca/frontend/frontend', 'public', { recursive: true });

