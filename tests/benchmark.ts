import { file } from 'bun';

import server from '../src';
import { env } from '../src/libs/utils';

const API_URL = `http://${server.hostname}:${server.port}/files/upload`;
const API_KEY = env('API_KEY');

// --- Configuration ---
const CONCURRENT_REQUESTS = 50;
const TOTAL_REQUESTS = 500;
const FILE_TO_UPLOAD_PATH = './README.md';

async function runBenchmark() {
    console.log("--- Starting API Benchmark ---");
    console.log(`Target: ${API_URL}`);
    console.log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`);
    console.log(`Total Requests: ${TOTAL_REQUESTS}`);
    console.log("----------------------------\n");

    const fileToUpload = file(FILE_TO_UPLOAD_PATH);
    if (!await fileToUpload.exists()) {
        console.error(`Error: Benchmark file not found at '${FILE_TO_UPLOAD_PATH}'. Please create it.`);
        process.exit(1);
    }

    const results = {
        successful: 0,
        failed: 0,
        latencies: [] as number[],
    };

    const requests: Promise<void>[] = [];
    const startTime = performance.now();

    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const requestPromise = (async () => {
            const formData = new FormData();
            formData.append('file', fileToUpload);

            const reqStartTime = performance.now();
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'x-api-key': API_KEY },
                    body: formData,
                });

                const reqEndTime = performance.now();
                results.latencies.push(reqEndTime - reqStartTime);

                if (response.status === 200) {
                    results.successful++;
                } else {
                    results.failed++;
                    // Optional: log failed responses
                    console.error(`Request failed with status ${response.status}: ${await response.text()}`);
                }
            } catch (_error) {
                results.failed++;
            }
        })();
        requests.push(requestPromise);

        // Simple concurrency limiting
        if (requests.length >= CONCURRENT_REQUESTS) {
            await Promise.all(requests);
            requests.length = 0;
        }
    }

    // Wait for any remaining requests
    await Promise.all(requests);

    const endTime = performance.now();
    const totalTimeSeconds = (endTime - startTime) / 1000;

    // --- Print Results ---
    const requestsPerSecond = results.successful / totalTimeSeconds;
    const avgLatency = results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length;

    console.log("\n--- Benchmark Results ---");
    console.log(`Total time: ${totalTimeSeconds.toFixed(2)} seconds`);
    console.log(`Successful requests: ${results.successful}`);
    console.log(`Failed requests: ${results.failed}`);
    console.log(`Requests per second (RPS): ${requestsPerSecond.toFixed(2)}`);
    console.log(`Average latency: ${avgLatency.toFixed(2)} ms`);
    console.log("-------------------------\n");
}

runBenchmark();