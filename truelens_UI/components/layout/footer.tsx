import { BuyMeACoffee } from "../shared/icons";

export default function Footer() {
  return (
    <div className="absolute w-full py-5 text-center">
      <p className="text-gray-500">
        TrueLens - Verified News with Stellar
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Built on Stellar Testnet • © {new Date().getFullYear()} TrueLens. All rights reserved.
      </p>
    </div>
  );
}
