const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 5000;

http.createServer((req, res) => {
    const handleFileRequest = (filePath, contentType) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    };

    if (req.url === '/') {
        const indexPath = path.join(__dirname, 'index.html');
        handleFileRequest(indexPath, 'text/html');
    } else {
        const filePath = path.join(__dirname, req.url);
        const contentType = path.extname(filePath) === '.css' ? 'text/css' : 'application/javascript';
        handleFileRequest(filePath, contentType);
    }
})
.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});
