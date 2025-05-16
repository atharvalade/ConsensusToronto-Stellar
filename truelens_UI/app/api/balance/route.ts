import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock balance API endpoint for TrueLens
export async function GET(request: NextRequest) {
  try {
    // Parse the address from the query string
    const address = request.nextUrl.searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      );
    }
    
    // Generate a realistic-looking mock balance response
    // In a real implementation, this would query the Stellar network
    const mockBalance = {
      address: address,
      balance: {
        // Main XLM balance
        xlm: 1000 + Math.floor(Math.random() * 5000),
        // TrueLens token balance (TRUE)
        true_token: 500 + Math.floor(Math.random() * 2000),
        // Staked amount
        staked: 50 + Math.floor(Math.random() * 200),
        // Rewards earned
        rewards_earned: Math.floor(Math.random() * 100)
      },
      // Add some additional data that would be available in a real implementation
      account_info: {
        last_ledger: 40000000 + Math.floor(Math.random() * 1000000),
        created_at: new Date().toISOString(),
        is_active: true
      }
    };
    
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(mockBalance);
  } catch (error) {
    console.error('Error in balance API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}

// Handle POST requests for updating balance data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, action, amount } = body;
    
    if (!address || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Mock response based on the action
    let result: any = { success: true };
    
    switch (action) {
      case 'stake':
        result = {
          success: true,
          transaction_hash: 'T' + Array(64).fill(0).map(() => 
            '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join(''),
          amount_staked: amount || 10,
          new_balance: 1000 + Math.floor(Math.random() * 5000) - (amount || 10)
        };
        break;
        
      case 'unstake':
        result = {
          success: true,
          transaction_hash: 'T' + Array(64).fill(0).map(() => 
            '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join(''),
          amount_unstaked: amount || 10,
          new_balance: 1000 + Math.floor(Math.random() * 5000) + (amount || 10)
        };
        break;
        
      case 'claim_rewards':
        result = {
          success: true,
          transaction_hash: 'T' + Array(64).fill(0).map(() => 
            '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join(''),
          rewards_claimed: amount || Math.floor(Math.random() * 50),
          new_balance: 1000 + Math.floor(Math.random() * 5000) + (amount || Math.floor(Math.random() * 50))
        };
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in balance API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 