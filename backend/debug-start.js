console.log("STARTING DEBUG SERVER ES MODULE");
import http from 'http';

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
});

const PORT = 5001;
server.listen(PORT, () => {
    console.log(`Debug Server running at http://localhost:${PORT}/`);
});
