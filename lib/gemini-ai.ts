/**
 * Gemini AI Integration for Feedback Fusion
 * 
 * This module provides AI-powered functionality for:
 * - Automatic tag generation from feedback content
 * - Insight generation from grouped feedback themes
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TagGenerationResult, InsightGenerationResult, AiInsight } from './types';

// Initialize Gemini AI client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate relevant tags for feedback using Gemini AI
 * 
 * @param title - Feedback title
 * @param description - Feedback description
 * @returns Promise<TagGenerationResult> - Array of relevant tags
 */
export async function generateTags(title: string, description: string): Promise<TagGenerationResult> {
  try {
    console.log('🤖 Generating tags for feedback:', { title: title.substring(0, 50) + '...' });
    
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
Analyze this feedback and generate 2-4 relevant tags that categorize the request.

Title: "${title}"
Description: "${description}"

Instructions:
- Return ONLY a JSON array of strings (e.g., ["UI/UX", "Performance", "Feature Request"])
- Use these categories when relevant: UI/UX, Performance, Feature Request, Bug Fix, Integration, Mobile, Desktop, API, Security, Analytics, Workflow, Automation, Export, Admin, User Management
- Create new categories if none fit well, but prefer existing ones
- Tags should be 1-3 words maximum
- Focus on the PRIMARY purpose and technical area

Example response: ["Feature Request", "Export", "Analytics"]

Response (JSON array only):`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('🤖 Raw AI response:', text);
    
    // Parse JSON response
    let tags: string[];
    try {
      // Clean the response - remove any markdown formatting
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      tags = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', text);
      // Fallback: extract tags from text using regex
      const tagMatches = text.match(/"([^"]+)"/g);
      if (tagMatches) {
        tags = tagMatches.map(match => match.replace(/"/g, ''));
      } else {
        tags = ['Feature Request']; // Safe fallback
      }
    }
    
    // Validate and clean tags
    const validTags = tags
      .filter(tag => typeof tag === 'string' && tag.length > 0)
      .map(tag => tag.trim())
      .slice(0, 4); // Limit to 4 tags maximum
    
    console.log('✅ Generated tags:', validTags);
    
    return {
      success: true,
      tags: validTags,
      processingTime: Date.now()
    };
    
  } catch (error) {
    console.error('❌ Error generating tags:', error);
    return {
      success: false,
      tags: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime: Date.now()
    };
  }
}

/**
 * Generate insights from grouped feedback data using Gemini AI
 * 
 * @param theme - The common theme/tag for the feedback group
 * @param feedbacks - Array of feedback items with the same theme
 * @returns Promise<InsightGenerationResult> - Generated insight and analysis
 */
export async function generateInsights(
  theme: string, 
  feedbacks: Array<{ id: string; title: string; description: string; votes: number }>
): Promise<InsightGenerationResult> {
  try {
    console.log(`🧠 Generating insights for theme: ${theme} (${feedbacks.length} items)`);
    
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Calculate total votes and prepare feedback data
    const totalVotes = feedbacks.reduce((sum, f) => sum + f.votes, 0);
    const feedbackData = feedbacks.map(f => ({
      title: f.title,
      description: f.description.substring(0, 200), // Limit to 200 chars for prompt size
      votes: f.votes
    }));
    
    const prompt = `
Analyze this group of feature requests and generate a strategic insight.

Theme: "${theme}"
Total Feedback Items: ${feedbacks.length}
Total Votes: ${totalVotes}

Feedback Details:
${feedbackData.map((f, i) => `${i + 1}. "${f.title}" (${f.votes} votes)\n   ${f.description}`).join('\n\n')}

Instructions:
- Generate ONE concise insight (2-3 sentences max) that identifies the core user need
- Assign a priority score from 1-10 based on vote count, frequency, and strategic importance
- Focus on actionable business value, not just technical implementation
- Consider user impact and implementation complexity

Return ONLY this JSON format:
{
  "insight": "A concise insight about the user need and business opportunity",
  "priorityScore": 7,
  "reasoning": "Brief explanation of the priority score"
}

Response (JSON only):`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('🧠 Raw AI insight response:', text);
    
    // Parse JSON response
    let aiResponse: { insight: string; priorityScore: number; reasoning: string };
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiResponse = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ Failed to parse insight response as JSON:', text);
      // Create fallback insight
      aiResponse = {
        insight: `Users are requesting improvements in ${theme}. This theme has ${feedbacks.length} requests with ${totalVotes} total votes, indicating significant user interest.`,
        priorityScore: Math.min(Math.max(Math.floor(totalVotes / feedbacks.length), 1), 10),
        reasoning: 'Fallback calculation based on vote density'
      };
    }
    
    // Validate response
    const insight: AiInsight = {
      id: '', // Will be set by database
      theme,
      insightSummary: aiResponse.insight || `Analysis needed for ${theme} requests`,
      priorityScore: Math.min(Math.max(aiResponse.priorityScore || 1, 1), 10),
      feedbackCount: feedbacks.length,
      sampleFeedbackIds: feedbacks.map(f => f.id).slice(0, 3), // Store up to 3 sample IDs
      generatedAt: new Date(),
      exportedAt: null
    };
    
    console.log('✅ Generated insight:', { theme, priority: insight.priorityScore, feedbackCount: insight.feedbackCount });
    
    return {
      success: true,
      insight,
      reasoning: aiResponse.reasoning || 'Generated successfully',
      processingTime: Date.now()
    };
    
  } catch (error) {
    console.error('❌ Error generating insights:', error);
    return {
      success: false,
      insight: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime: Date.now()
    };
  }
}

/**
 * Test the Gemini AI connection and functionality
 * Used for verification during setup
 */
export async function testGeminiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await generateTags(
      'Add dark mode support', 
      'It would be great to have a dark theme option for better user experience during night time usage.'
    );
    
    if (result.success && result.tags.length > 0) {
      return {
        success: true,
        message: `✅ Gemini AI is working! Generated ${result.tags.length} tags: ${result.tags.join(', ')}`
      };
    } else {
      return {
        success: false,
        message: `❌ Gemini AI test failed: ${result.error || 'No tags generated'}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Gemini AI connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 