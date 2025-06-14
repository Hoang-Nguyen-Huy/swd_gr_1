package com.example.swd.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CryptoEvent {
    private String cryptoCurrencyId;
    private Double avgPrice;
    private Double avgMarketCap;
    private Double avgMarketCapRank;
    private Double avgTotalVolume;
    private Double avgHigh24h;
    private Double avgLow24h;
    private Double avgPriceChangePercentage;
    private Double avgMarketCapChangePercentage;
}
