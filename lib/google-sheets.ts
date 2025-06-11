import { google } from 'googleapis'
import { Feedback, Status } from './types'
import { SHEETS_CONFIG } from './constants'

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Feedback'

/**
 * Initialize the Google Sheet with headers if it doesn't exist
 */
export async function initializeSheet(): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is required')
    }

    // Check if sheet exists and has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:Z1`,
    })

    // If no data or incorrect headers, set up the sheet
    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [SHEETS_CONFIG.HEADERS],
        },
      })
      console.log('✅ Google Sheet initialized with headers')
    }

    return true
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheet:', error)
    return false
  }
}

/**
 * Convert Feedback object to Google Sheets row format
 */
function feedbackToRow(feedback: Feedback): string[] {
  return [
    feedback.id,
    feedback.title,
    feedback.description,
    feedback.category,
    feedback.subCategory || '',
    feedback.status,
    feedback.votes.toString(),
    feedback.submittedAt,
    feedback.updatedAt,
    feedback.isApproved.toString(),
    feedback.moderatedAt || '',
    feedback.moderatedBy || '',
    feedback.adminNotes || '',
    feedback.tags?.join(', ') || '',
    feedback.votedBy?.join(',') || '',
  ]
}

/**
 * Convert Google Sheets row to Feedback object
 */
function rowToFeedback(row: string[]): Feedback {
  return {
    id: row[0] || '',
    title: row[1] || '',
    description: row[2] || '',
    category: (row[3] as any) || 'BackOffice',
    subCategory: (row[4] as any) || undefined,
    status: (row[5] as Status) || 'Under Review',
    votes: parseInt(row[6]) || 0,
    submittedAt: row[7] || new Date().toISOString(),
    updatedAt: row[8] || new Date().toISOString(),
    isApproved: row[9] === 'true',
    moderatedAt: row[10] || undefined,
    moderatedBy: row[11] || undefined,
    adminNotes: row[12] || undefined,
    tags: row[13] ? row[13].split(', ').filter(Boolean) : [],
    votedBy: row[14] ? row[14].split(',').filter(Boolean) : [],
  }
}

/**
 * Get all feedback from Google Sheets
 */
export async function getAllFeedback(): Promise<Feedback[]> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is required')
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:Z`,
    })

    if (!response.data.values) {
      return []
    }

    return response.data.values.map(rowToFeedback).filter(feedback => feedback.id)
  } catch (error) {
    console.error('❌ Failed to get feedback from Google Sheets:', error)
    throw new Error('Failed to retrieve feedback data')
  }
}

/**
 * Add new feedback to Google Sheets
 */
export async function addFeedback(feedback: Feedback): Promise<Feedback> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is required')
    }

    const row = feedbackToRow(feedback)

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    })

    console.log(`✅ Added feedback to Google Sheets: ${feedback.title}`)
    return feedback
  } catch (error) {
    console.error('❌ Failed to add feedback to Google Sheets:', error)
    throw new Error('Failed to save feedback')
  }
}

/**
 * Update feedback in Google Sheets
 */
export async function updateFeedback(feedbackId: string, updates: Partial<Feedback>): Promise<Feedback | null> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is required')
    }

    // Get all data to find the row
    const allFeedback = await getAllFeedback()
    const feedbackIndex = allFeedback.findIndex(f => f.id === feedbackId)

    if (feedbackIndex === -1) {
      return null
    }

    const updatedFeedback = { ...allFeedback[feedbackIndex], ...updates, updatedAt: new Date().toISOString() }
    const row = feedbackToRow(updatedFeedback)

    // Update the specific row (index + 2 because row 1 is headers, arrays are 0-indexed)
    const rowNumber = feedbackIndex + 2
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:Z${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    })

    console.log(`✅ Updated feedback in Google Sheets: ${updatedFeedback.title}`)
    return updatedFeedback
  } catch (error) {
    console.error('❌ Failed to update feedback in Google Sheets:', error)
    throw new Error('Failed to update feedback')
  }
}

/**
 * Toggles a vote for a feedback item in Google Sheets
 * @returns The updated feedback item and whether the vote was added or removed
 */
export async function updateVote(feedbackId: string, userId: string): Promise<{ updatedFeedback: Feedback | null; voteCasted: boolean }> {
  try {
    const allFeedback = await getAllFeedback()
    const feedback = allFeedback.find(f => f.id === feedbackId)

    if (!feedback) {
      return { updatedFeedback: null, voteCasted: false };
    }
    
    const votedBy = feedback.votedBy || [];
    const userVoteIndex = votedBy.indexOf(userId);
    
    let voteCasted: boolean;
    let newVotes: number;

    if (userVoteIndex > -1) {
      // User has already voted, so remove vote
      votedBy.splice(userVoteIndex, 1);
      newVotes = feedback.votes - 1;
      voteCasted = false;
    } else {
      // User has not voted, so add vote
      votedBy.push(userId);
      newVotes = feedback.votes + 1;
      voteCasted = true;
    }

    const updatedFeedback = await updateFeedback(feedbackId, { 
      votes: newVotes,
      votedBy: votedBy
    });

    return { updatedFeedback, voteCasted };

  } catch (error) {
    console.error('❌ Failed to update vote in Google Sheets:', error)
    throw new Error('Failed to update vote count')
  }
}

/**
 * Increment vote count for feedback
 */
export async function incrementVote(feedbackId: string): Promise<Feedback | null> {
  try {
    const allFeedback = await getAllFeedback()
    const feedback = allFeedback.find(f => f.id === feedbackId)

    if (!feedback) {
      return null
    }

    return await updateFeedback(feedbackId, { votes: feedback.votes + 1 })
  } catch (error) {
    console.error('❌ Failed to increment vote in Google Sheets:', error)
    throw new Error('Failed to update vote count')
  }
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(feedbackId: string): Promise<Feedback | null> {
  try {
    const allFeedback = await getAllFeedback()
    return allFeedback.find(f => f.id === feedbackId) || null
  } catch (error) {
    console.error('❌ Failed to get feedback by ID from Google Sheets:', error)
    return null
  }
}

/**
 * Delete feedback from Google Sheets
 */
export async function deleteFeedback(feedbackId: string): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is required')
    }

    const allFeedback = await getAllFeedback()
    const feedbackIndex = allFeedback.findIndex(f => f.id === feedbackId)

    if (feedbackIndex === -1) {
      return false
    }

    // Delete the row (index + 2 because row 1 is headers, arrays are 0-indexed)
    const rowNumber = feedbackIndex + 2
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming first sheet
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    })

    console.log(`✅ Deleted feedback from Google Sheets: ${feedbackId}`)
    return true
  } catch (error) {
    console.error('❌ Failed to delete feedback from Google Sheets:', error)
    throw new Error('Failed to delete feedback')
  }
}

/**
 * Test Google Sheets connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      console.error('❌ GOOGLE_SHEETS_SPREADSHEET_ID environment variable is missing')
      return false
    }

    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    console.log(`✅ Successfully connected to Google Sheet: ${response.data.properties?.title}`)
    return true
  } catch (error) {
    console.error('❌ Failed to connect to Google Sheets:', error)
    return false
  }
}

/**
 * Export feedback and AI insights to Google Sheets (for automation system)
 * This function creates/updates separate sheets for feedback and insights
 */
export async function exportToGoogleSheets(
  feedbacks: Feedback[], 
  insights: any[]
): Promise<void> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is required');
    }
    
    console.log(`📊 Exporting ${feedbacks.length} feedback items and ${insights.length} insights to Google Sheets`);
    
    // Prepare feedback data for export
    const feedbackHeaders = [
      'ID', 'Title', 'Description', 'Category', 'Sub Category', 'Status', 
      'Votes', 'Tags', 'Created At', 'AI Tagged At', 'Is Approved'
    ];
    
    const feedbackRows = feedbacks.map(feedback => [
      feedback.id,
      feedback.title,
      feedback.description,
      feedback.category,
      feedback.subCategory || '',
      feedback.status,
      feedback.votes.toString(),
      Array.isArray(feedback.tags) ? feedback.tags.join(', ') : (feedback.tags || ''),
      feedback.submittedAt || feedback.createdAt,
      feedback.aiTaggedAt || '',
      feedback.isApproved.toString()
    ]);
    
    // Prepare insights data for export  
    const insightHeaders = [
      'Theme', 'Insight Summary', 'Priority Score', 'Feedback Count', 
      'Sample Feedback IDs', 'Generated At', 'Exported At'
    ];
    
    const insightRows = insights.map(insight => [
      insight.theme,
      insight.insightSummary,
      insight.priorityScore.toString(),
      insight.feedbackCount.toString(),
      Array.isArray(insight.sampleFeedbackIds) ? insight.sampleFeedbackIds.join(', ') : '',
      insight.generatedAt?.toISOString() || '',
      new Date().toISOString() // Mark as exported now
    ]);
    
    // Clear and update Feedback Analysis sheet
    if (feedbacks.length > 0) {
      const feedbackSheetName = 'Feedback_Analysis';
      
      // Clear existing data
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${feedbackSheetName}!A:Z`
      });
      
      // Write headers and data
      const feedbackData = [feedbackHeaders, ...feedbackRows];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${feedbackSheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: feedbackData
        }
      });
      
      console.log(`✅ Exported ${feedbackRows.length} feedback items to ${feedbackSheetName}`);
    }
    
    // Clear and update AI Insights sheet
    if (insights.length > 0) {
      const insightsSheetName = 'AI_Insights';
      
      // Clear existing data
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${insightsSheetName}!A:Z`
      });
      
      // Write headers and data
      const insightData = [insightHeaders, ...insightRows];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${insightsSheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: insightData
        }
      });
      
      console.log(`✅ Exported ${insightRows.length} insights to ${insightsSheetName}`);
    }
    
    console.log('🎉 Google Sheets export completed successfully');
    
  } catch (error) {
    console.error('❌ Failed to export to Google Sheets:', error);
    throw new Error(`Google Sheets export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 