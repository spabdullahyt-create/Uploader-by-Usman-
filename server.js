// server.js
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// 🔑 YOUR NFT.Storage API key goes here
const NFT_KEY = '352af462.d8cb3b8db0b6475ba2b494775de15cd2';

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = fs.readFileSync(req.file.path);

        const response = await fetch('https://api.nft.storage/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NFT_KEY}`
            },
            body: file
        });

        const data = await response.json();
        fs.unlinkSync(req.file.path); // cleanup temporary file

        if (data && data.value && data.value.cid) {
            const cid = data.value.cid;
            const url = `https://ipfs.io/ipfs/${cid}/${req.file.originalname}`;
            res.json({ url, cid });
        } else {
            res.status(500).json({ error: 'Upload failed', details: data });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));