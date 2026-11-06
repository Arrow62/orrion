export function supplierInrPrice(amount: number, inrRate: number) {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(inrRate) || inrRate <= 0) throw new Error("A verified supplier price and exchange rate are required");
  return Math.round(amount * inrRate);
}

export const supplierInitialStock = () => 0;