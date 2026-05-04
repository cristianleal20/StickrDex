import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';

const dir = 'e:/StickrDex-1/images';
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.jpg'));

const MAX_CONCURRENCY = 4; // To speed things up
const uniqueNumbers = new Set();
const MAX_STICKER_NUMBER = 980;

async function processFile(worker, file) {
    const p = path.join(dir, file);
    try {
        const { data: { text } } = await worker.recognize(p);
        const numbers = [...text.matchAll(/\b(\d{1,4})\b/g)].map(m => parseInt(m[1], 10));
        const valid = numbers.filter(n => n >= 1 && n <= MAX_STICKER_NUMBER);
        valid.forEach(n => uniqueNumbers.add(n));
        // console.log(`Processed ${file}: found ${valid.length} numbers.`);
    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
}

async function main() {
    console.log(`Starting scan of ${files.length} images...`);
    const workers = [];
    for (let i = 0; i < MAX_CONCURRENCY; i++) {
        const worker = await createWorker('eng'); 
        workers.push(worker);
    }
    
    let fileIndex = 0;
    
    async function workerTask(workerId) {
        const worker = workers[workerId];
        while (fileIndex < files.length) {
            const currentIdx = fileIndex++;
            await processFile(worker, files[currentIdx]);
        }
    }
    
    const tasks = workers.map((_, i) => workerTask(i));
    await Promise.all(tasks);
    
    for (const w of workers) {
        await w.terminate();
    }
    
    const ownedCount = uniqueNumbers.size;
    const missingCount = MAX_STICKER_NUMBER - ownedCount;
    
    console.log(`\n=== RESULTS ===`);
    console.log(`Total owned: ${ownedCount}`);
    console.log(`Total missing: ${missingCount}`);
    
    const missing = [];
    for (let i = 1; i <= MAX_STICKER_NUMBER; i++) {
        if (!uniqueNumbers.has(i)) missing.push(i);
    }
    
    const results = {
        totalOwned: ownedCount,
        totalMissing: missingCount,
        missing: missing
    };
    
    fs.writeFileSync('scan-results.json', JSON.stringify(results, null, 2));
    console.log('Results saved to scan-results.json');
}

main().catch(console.error);
