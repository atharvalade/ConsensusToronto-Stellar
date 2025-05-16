/**
 * Type declarations for modules without their own type definitions
 */

declare module '@kalepail/passkey-kit' {
  export class PasskeyKit {
    constructor(options: {
      domain: string;
      rpName: string;
      rpIcon: string;
    });
    
    register(): Promise<{ publicKey: string }>;
    getAccount(): Promise<any>;
  }
}

declare module '@stellar/launchtube' {
  export function submitTransaction(params: {
    source: any;
    operations: any[];
  }): Promise<any>;
} 