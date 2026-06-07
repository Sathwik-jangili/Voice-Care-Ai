import { NextResponse } from 'next/server';
import { getDbConnection } from '@/scripts/db';

interface ContentItem {
  title: string;
  content: string;
  source: 'guide' | 'navigator';
}

// Smart keyword-based search function
function findBestMatch(query: string, items: ContentItem[]): ContentItem {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 2);
  
  // Calculate relevance scores
  const scoredItems = items.map(item => {
    const lowerTitle = item.title.toLowerCase();
    const lowerContent = item.content.toLowerCase();
    
    let score = 0;
    
    // Title matches get higher score
    queryWords.forEach(word => {
      if (lowerTitle.includes(word)) score += 10;
      if (lowerContent.includes(word)) score += 3;
    });
    
    // Exact phrase match gets bonus
    if (lowerTitle.includes(lowerQuery)) score += 20;
    if (lowerContent.includes(lowerQuery)) score += 5;
    
    // Health-specific keyword matching
    const healthKeywords = ['blood pressure', 'diabetes', 'cholesterol', 'heart', 'sugar', 'medication', 'diet', 'exercise'];
    healthKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword) && lowerTitle.includes(keyword)) score += 15;
      if (lowerQuery.includes(keyword) && lowerContent.includes(keyword)) score += 7;
    });
    
    return { item, score };
  });
  
  // Sort by score and return the best match
  scoredItems.sort((a, b) => b.score - a.score);
  return scoredItems[0]?.item || items[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const db = getDbConnection();

  try {
    console.log('Smart AI Search called with query:', query);

    // 1. Fetch data from database
    const guideData = db.prepare('SELECT topic as title, explanation as content FROM guide').all() as { title: string; content: string }[];
    const navigatorData = db.prepare("SELECT query as title, what_to_expect || ' ' || things_to_bring || ' ' || questions_to_ask || ' ' || notes as content FROM navigator").all() as { title: string; content: string }[];
    
    const allContent: ContentItem[] = [
      ...guideData.map(item => ({ ...item, source: 'guide' })),
      ...navigatorData.map(item => ({ ...item, source: 'navigator' }))
    ];

    console.log(`Found ${allContent.length} items in database`);

    if (allContent.length === 0) {
      return NextResponse.json({ error: 'No data found in database' }, { status: 404 });
    }

    // 2. Find the best match using smart keyword matching
    const bestMatch = findBestMatch(query, allContent);
    
    // 3. Generate contextual response
    let detailedResponse = `Based on your question about "${query}", here is the most relevant information:\n\n**Topic**: ${bestMatch.title}\n\n**Details**: ${bestMatch.content}`;
    
    // Add additional context if it's a guide result
    if (bestMatch.source === 'guide') {
      const nextSteps = db.prepare('SELECT next_steps FROM guide WHERE topic = ?').get(bestMatch.title) as { next_steps: string } | undefined;
      if (nextSteps?.next_steps) {
        detailedResponse += `\n\n**Recommended Actions**:\n${nextSteps.next_steps}`;
      }
    }

    // 4. Save the search and response
    db.prepare('INSERT INTO guide_searches (query, response) VALUES (?, ?)').run(query, detailedResponse);

    return NextResponse.json({ answer: detailedResponse });

  } catch (error: any) {
    console.error('Smart AI Search error:', error);
    return NextResponse.json({ error: 'Failed to perform search', details: error.message }, { status: 500 });
  }
}
