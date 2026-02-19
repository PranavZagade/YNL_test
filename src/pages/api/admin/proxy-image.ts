import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const config = {
    api: {
        responseLimit: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Missing file ID' });
    }

    try {
        // 1. Authenticate (Scope: drive.readonly)
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        await auth.authorize();
        const drive = google.drive({ version: 'v3', auth });

        // 2. Get Metadata (to check mime type and existence)
        // console.log(`Fetching metadata for file ID: ${id}`);
        const metadata = await drive.files.get({
            fileId: id,
            fields: 'id, name, mimeType, size',
        });

        // 3. Get Content Stream
        const response = await drive.files.get(
            { fileId: id, alt: 'media' },
            { responseType: 'stream' }
        );

        // 4. Pipe to response
        res.setHeader('Content-Type', metadata.data.mimeType || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour

        // Cast to Readable stream to satisfy TypeScript
        (response.data as Readable).pipe(res);

    } catch (error: any) {
        console.error('Proxy Image Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch image', error: error.message });
    }
}
