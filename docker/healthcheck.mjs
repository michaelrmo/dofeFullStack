const urls = [
  "http://127.0.0.1:8080/healthz",
  "http://127.0.0.1:3002/healthz",
  "http://127.0.0.1:4242/healthz",
];

try {
  await Promise.all(urls.map(async (url) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }
  }));
} catch (error) {
  console.error(`Health check failed: ${error.message}`);
  process.exit(1);
}
