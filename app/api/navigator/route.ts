import { NextResponse } from 'next/server';
import { getDbConnection } from '@/scripts/db';
import { pipeline, type Pipeline } from '@xenova/transformers';

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

// Singleton class to ensure we only load the model once.
class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: Pipeline | null = null;

  static async getInstance() {
    if (this.instance === null) {
      console.log('Initializing embedding model...');
      this.instance = await pipeline(this.task, this.model);
      console.log('Embedding model loaded.');
    }
    return this.instance;
  }
}

interface NavigatorItem {
  query: string;
  what_to_expect: string;
  things_to_bring: string;
  questions_to_ask: string;
  notes: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const situation = searchParams.get('situation');

  if (!situation) {
    return NextResponse.json({ error: 'Situation parameter is required' }, { status: 400 });
  }

  const db = getDbConnection();

  try {
    // 1. Fetch all data from the navigator table
    const navigatorData = db.prepare('SELECT query, what_to_expect, things_to_bring, questions_to_ask, notes FROM navigator').all() as NavigatorItem[];

    // 2. Get the embedding model
    const extractor = await EmbeddingPipeline.getInstance();

    // 3. Create embeddings
    const documentEmbeddings = await Promise.all(
      navigatorData.map(item => extractor(`${item.query}: ${item.what_to_expect} ${item.things_to_bring} ${item.questions_to_ask} ${item.notes}`, { pooling: 'mean', normalize: true }).then(res => Array.from(res.data)))
    );
    const queryEmbeddingOutput = await extractor(situation, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(queryEmbeddingOutput.data);

    // 4. Calculate similarities
    const similarities = documentEmbeddings.map((docEmbedding, i) => ({
      index: i,
      score: cosineSimilarity(queryEmbedding, docEmbedding),
    }));

    // 5. Sort by score and get the top result
    const sortedResults = similarities.sort((a, b) => b.score - a.score);
    const topResult = sortedResults[0];
    const bestMatch = navigatorData[topResult.index];

    // 6. Construct a clear, actionable plan
    const actionablePlan = `Based on your situation: "${situation}", here are your recommended next steps:\n\n**What to Expect**:\n${bestMatch.what_to_expect}\n\n**Things to Bring**:\n${bestMatch.things_to_bring}\n\n**Questions to Ask Your Doctor**:\n${bestMatch.questions_to_ask}\n\n**Important Notes**:\n${bestMatch.notes}`;

    // 7. Save the search and response to the navigator_searches table
    db.prepare('INSERT INTO navigator_searches (query, response) VALUES (?, ?)').run(situation, actionablePlan);

    return NextResponse.json({ plan: actionablePlan });

  } catch (error: any) {
    console.error('Navigator API error:', error);
    return NextResponse.json({ error: 'Failed to get next steps', details: error.message }, { status: 500 });
  } finally {
    if (db && db.open) {
      db.close();
    }
  }
}
