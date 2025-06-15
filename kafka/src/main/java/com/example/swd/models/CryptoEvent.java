package com.example.swd.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CryptoEvent {
    @JsonProperty("cryptocurrency_id")
    private Integer cryptoCurrencyId;

    @JsonProperty("avg_price")
    private Double avgPrice;

    @JsonProperty("avg_market_cap")
    private Double avgMarketCap;

    @JsonProperty("avg_market_cap_rank")
    private Double avgMarketCapRank;

    @JsonProperty("avg_total_volume")
    private Double avgTotalVolume;

    @JsonProperty("avg_high_24h")
    private Double avgHigh24h;

    @JsonProperty("avg_low_24h")
    private Double avgLow24h;

    @JsonProperty("avg_price_change_pct")
    private Double avgPriceChangePercentage;

    @JsonProperty("avg_market_cap_change_pct")
    private Double avgMarketCapChangePercentage;
}
