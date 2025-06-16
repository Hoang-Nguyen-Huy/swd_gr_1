export interface CryptoData {
  name: string;
  symbol: string;
  price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
  last_updated: string;
}

export interface CryptoDataResponse {
  coins: CryptoData[];
  last_updated: string;
}

// New types for Kafka data
export interface KafkaCryptoEvent {
  cryptocurrency_id: number;
  avg_price: number;
  avg_market_cap: number;
  avg_market_cap_rank: number;
  avg_total_volume: number;
  avg_high_24h: number;
  avg_low_24h: number;
  avg_price_change_pct: number;
  avg_market_cap_change_pct: number;
}
