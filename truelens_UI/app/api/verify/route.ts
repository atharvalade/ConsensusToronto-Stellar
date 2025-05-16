import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock verification API endpoint for TrueLens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newsId, action, userAddress, stake, ipfsHash } = body;
    
    // Validate required parameters
    if (!newsId || !action || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Validate action
    if (action !== 'verify' && action !== 'flag') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "verify" or "flag"' },
        { status: 400 }
      );
    }
    
    // Mock blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock transaction hash
    const txHash = 'T' + Array(64).fill(0).map(() => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
    
    // Mock successful response
    return NextResponse.json({
      success: true,
      newsId,
      action,
      userAddress,
      stake: stake || 10,
      transactionHash: txHash,
      timestamp: new Date().toISOString(),
      currentConsensus: action === 'verify' ? 
        (Math.floor(Math.random() * 30) + 50) : // Random 50-80% if verified
        (Math.floor(Math.random() * 30) + 20),  // Random 20-50% if flagged
      gasFee: "0.00001 XLM",
      ipfsHash: ipfsHash || null
    });
  } catch (error) {
    console.error('Error in verification API:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}

// Get verification status for a news item
export async function GET(request: NextRequest) {
  try {
    // Parse the newsId from the query string
    const newsId = request.nextUrl.searchParams.get('newsId');
    
    if (!newsId) {
      return NextResponse.json(
        { error: 'Missing newsId parameter' },
        { status: 400 }
      );
    }
    
    // Generate mock verification stats
    const verifiedCount = Math.floor(Math.random() * 100) + 20;
    const flaggedCount = Math.floor(Math.random() * 50) + 10;
    const totalCount = verifiedCount + flaggedCount;
    
    // Calculate percentages
    const verifiedPercentage = Math.round((verifiedCount / totalCount) * 100);
    const flaggedPercentage = 100 - verifiedPercentage;
    
    // Create mock response
    const response = {
      newsId,
      status: {
        verified: verifiedCount,
        flagged: flaggedCount,
        total: totalCount,
        verifiedPercentage,
        flaggedPercentage,
        consensus: verifiedPercentage > 50 ? 'verified' : 'flagged',
        confidenceLevel: verifiedPercentage > 70 || flaggedPercentage > 70 ? 'high' : 'medium'
      },
      participants: Array.from({ length: 5 }, (_, i) => ({
        address: 'G' + Array(55).fill(0).map(() => 
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]).join(''),
        action: Math.random() > 0.3 ? 'verify' : 'flag',
        stake: Math.floor(Math.random() * 50) + 10,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
      })),
      ipfsLink: 'https://ipfs.io/ipfs/Qm' + Array(44).fill(0).map(() => 
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 62)]).join('')
    };
    
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in verification status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
} 