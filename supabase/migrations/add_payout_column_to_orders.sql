-- Add payout column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payout DECIMAL(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN orders.payout IS 'The amount to be paid to the provider for this order';
