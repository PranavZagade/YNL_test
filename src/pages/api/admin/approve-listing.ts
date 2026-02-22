import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth, adminDb, FieldValue } from '@/lib/firebase-admin';
import { Resend } from 'resend';
import { renderAccountSetupEmail } from '@/lib/email-renderer';
import { google } from 'googleapis';
import { getUniversityFromEmail } from '@/lib/user-management';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Validate Admin (verify token from header)
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        const listingData = req.body;
        // Ensure email is a string and trimmed safely
        let { email, name, sheetRowId, ...listingFields } = listingData;

        email = (email || '').toString().trim();
        name = (name || '').toString().trim();

        console.log(`[API] Processing approval for email: '${email}' (Length: ${email.length})`);

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: `Invalid email address format: '${email}'` });
        }

        // 2. Get or Create User
        let userRecord;
        let isNewUser = false;
        try {
            userRecord = await adminAuth.getUserByEmail(email);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // Create new user
                userRecord = await adminAuth.createUser({
                    email,
                    displayName: name || 'User',
                    emailVerified: false,
                });
                isNewUser = true;
                console.log('User was created:', userRecord.uid);
            } else {
                throw error;
            }
        }

        // Check for university verification
        const verifiedUniversity = getUniversityFromEmail(email);

        const uid = userRecord.uid;
        console.log('User id was generated:', uid);

        // 3. Update/Create User Profile in Firestore
        const userRef = adminDb.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({
                uid,
                email,
                displayName: name || userRecord.displayName,
                firstName: name ? name.split(' ')[0] : (userRecord.displayName ? userRecord.displayName.split(' ')[0] : ''),
                lastName: name && name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : '',
                role: 'user',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                photoURL: userRecord.photoURL || null,
                isProfileComplete: false,
                verifiedUniversity: verifiedUniversity || null,
            });
        }

        // 4. Create Listing Linked to User
        const newListingData: any = {
            ...listingFields,
            userId: uid, // Per user request: use userId mapped to uid
            // ownerUid: uid, // Removing ownerUid to keep it clean if userId is the standard
            userDisplayName: name || userRecord.displayName, // Map Name from sheet to userDisplayName
            status: 'active',
            isApproved: true,
            approvedAt: FieldValue.serverTimestamp(),
            ownerVerifiedUniversity: verifiedUniversity || null,
        };

        // Handle Date/Timestamp fields
        if (newListingData.moveIn && typeof newListingData.moveIn === 'string') {
            newListingData.moveIn = new Date(newListingData.moveIn);
        }
        if (newListingData.moveOut && typeof newListingData.moveOut === 'string') {
            newListingData.moveOut = new Date(newListingData.moveOut);
        }
        if (newListingData.moveIn && typeof newListingData.moveIn === 'object' && newListingData.moveIn.seconds) {
            newListingData.moveIn = new Date(newListingData.moveIn.seconds * 1000);
        }
        if (newListingData.moveOut && typeof newListingData.moveOut === 'object' && newListingData.moveOut.seconds) {
            newListingData.moveOut = new Date(newListingData.moveOut.seconds * 1000);
        }

        const listingRef = await adminDb.collection('listings').add(newListingData);
        console.log('Listing was added to firebase:', listingRef.id);

        // ==========================================
        // 6. UPDATE GOOGLE SHEET STATUS
        // ==========================================
        if (sheetRowId) {
            try {
                // Extract row number from "sheet_row_XYZ"
                const rowNumber = sheetRowId.replace('sheet_row_', '');

                if (!isNaN(parseInt(rowNumber))) {
                    console.log(`Updating Google Sheet Row ${rowNumber} Status to ADDED...`);

                    // Authenticate Google Sheets
                    const auth = new google.auth.JWT({
                        email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                        key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    });
                    await auth.authorize();
                    const sheets = google.sheets({ version: 'v4', auth });

                    // Update Column AC (Index 28) -> "ADDED"
                    // 0=A, 25=Z, 26=AA, 27=AB, 28=AC.

                    await sheets.spreadsheets.values.update({
                        spreadsheetId: process.env.GOOGLE_SHEET_ID,
                        range: `'Form Responses 1'!AC${rowNumber}`, // Update specific cell
                        valueInputOption: 'RAW',
                        requestBody: {
                            values: [['ADDED']]
                        }
                    });
                    console.log(`✅ Google Sheet Row ${rowNumber} marked as ADDED`);
                }
            } catch (sheetError) {
                console.error('Failed to update Google Sheet status:', sheetError);
                // Don't fail the request, just log it. Data is safe in Firebase.
            }
        }

        // 5. Send Account Setup Email (Only for new users)
        if (isNewUser) {
            try {
                // Generate Password Reset Link to get the oobCode
                const link = await adminAuth.generatePasswordResetLink(email);
                const urlObj = new URL(link);
                const oobCode = urlObj.searchParams.get('oobCode');

                if (oobCode) {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                    const setupUrl = `${baseUrl}/account-setup?oobCode=${oobCode}`;

                    const emailHtml = renderAccountSetupEmail({
                        userName: name || 'User',
                        setupUrl
                    });

                    await resend.emails.send({
                        from: 'YourNextLease <notification@yournextlease.com>',
                        to: email,
                        subject: 'Welcome to YourNextLease - Set Up Your Account',
                        html: emailHtml
                    });
                    console.log(`Sent email to user with link: ${email}`);
                }
            } catch (emailError) {
                console.error('Failed to send onboarding email:', emailError);
                // Don't fail the request, just log it
            }
        }

        // 7. Backend Listing Alerts
        // Note: We don't await this so the API responds instantly to the Admin frontend
        import('@/lib/server-listing-alerts').then(module => {
            module.checkServerListingAlerts(listingRef.id, newListingData).catch(err => {
                console.error('[API] Error in background alert task:', err);
            });
        });

        return res.status(200).json({
            success: true,
            listingId: listingRef.id,
            userId: uid,
            isNewUser,
            userEmail: email,
            message: isNewUser ? 'User was created' : 'Linked to existing user'
        });

    } catch (error: any) {
        console.error('Approval API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
