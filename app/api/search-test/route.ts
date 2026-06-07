import { NextResponse } from 'next/server';
import { getDbConnection } from '@/scripts/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const db = getDbConnection();

  try {
    console.log('Search test API called with query:', query);

    // 1. Fetch and type all data from the database
    const guideData = db.prepare('SELECT topic as title, explanation as content FROM guide').all() as { title: string; content: string }[];
    const navigatorData = db.prepare("SELECT query as title, what_to_expect || ' ' || things_to_bring || ' ' || questions_to_ask || ' ' || notes as content FROM navigator").all() as { title: string; content: string }[];
    
    console.log('Guide data count:', guideData.length);
    console.log('Navigator data count:', navigatorData.length);
    
    // Simple keyword matching for testing
    const allContent = [
      ...guideData.map(item => ({ ...item, source: 'guide' })),
      ...navigatorData.map(item => ({ ...item, source: 'navigator' }))
    ];

    // Find first result that contains the query
    const lowerQuery = query.toLowerCase();
    const match = allContent.find(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.content.toLowerCase().includes(lowerQuery)
    );

    if (match) {
      const detailedResponse = `Based on your question about "${query}", here is the most relevant information:\n\n**Topic**: ${match.title}\n\n**Details**: ${match.content}`;
      return NextResponse.json({ answer: detailedResponse });
    } else {
      // Return first item as fallback
      const fallback = allContent[0];
      const detailedResponse = `Based on your question about "${query}", here is some general information:\n\n**Topic**: ${fallback.title}\n\n**Details**: ${fallback.content}`;
      return NextResponse.json({ answer: detailedResponse });
    }

  } catch (error: any) {
    console.error('Search test API error:', error);
    return NextResponse.json({ error: 'Failed to perform search', details: error.message }, { status: 500 });
  }
}
