import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { transformSheetRow } from '@/lib/sheets-mapping';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 1. Authenticate
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        // Explicitly authorize to force token generation
        await auth.authorize();
        console.log('✅ Auth successful, token obtained');

        // EXPLICITLY set the auth client 
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // 2. Fetch Data
        console.log(`Fetching sheet ID: ${spreadsheetId}`);
        const response = await sheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: "'Form Responses 1'!A2:ZZ", // Quotes required for spaces
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            console.log('No rows found in sheet');
            return res.status(200).json({ listings: [] });
        }

        // DEBUG: Return raw data if requested
        if (req.query.debug === 'true') {
            return res.status(200).json({ rawRows: rows.slice(0, 5) });
        }

        // 3. Transform Data
        // Filter out nulls (failed parses) AND rows that are already "ADDED"
        const listings = rows
            .map((row, index) => transformSheetRow(row as string[], index + 1)) // index + 1 ensures unique ID distinct from header
            .filter(item => item !== null && (item as any).status !== 'ADDED');

        res.status(200).json({ listings });

    } catch (error: any) {
        console.error('!!!! GOOGLE SHEETS API ERROR !!!!');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);

        // Check for common env var issues
        if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL) console.error('MISSING: GOOGLE_SHEETS_CLIENT_EMAIL');
        if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY) console.error('MISSING: GOOGLE_SHEETS_PRIVATE_KEY');
        if (!process.env.GOOGLE_SHEET_ID) console.error('MISSING: GOOGLE_SHEET_ID');

        res.status(500).json({
            message: 'Failed to fetch sheets',
            error: error.message
        });
    }
}
