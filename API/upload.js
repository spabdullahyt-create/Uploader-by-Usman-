import fetch from 'node-fetch';
import formidable from 'formidable';

export const config = {
  api: { bodyParser: false } // required for file uploads
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing file' });
      return;
    }

    const file = files.file;
    const data = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.NFT_KEY}` },
      body: fs.readFileSync(file.filepath)
    });

    const result = await data.json();

    if (result && result.value && result.value.cid) {
      const cid = result.value.cid;
      const url = `https://ipfs.io/ipfs/${cid}/${file.originalFilename}`;
      res.status(200).json({ url, cid });
    } else {
      res.status(500).json({ error: 'Upload failed', details: result });
    }
  });
}
