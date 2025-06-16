import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import useKafkaCryptoData from "../hooks/useKafkaCryptoData";
import { KafkaCryptoEvent } from "../types/crypto";

const KafkaCryptoTable: React.FC = () => {
  const { cryptoEvents, connectionStatus, error, reconnect } =
    useKafkaCryptoData();

  const formatNumber = (num: number): string => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
  };

  const getPercentageColor = (percentage: number): string => {
    return percentage >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Kafka WebSocket Connection</span>
            <div className="flex items-center gap-2">
              <Badge
                variant={connectionStatus ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {connectionStatus ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {connectionStatus ? "Connected" : "Disconnected"}
              </Badge>
              <Button
                onClick={reconnect}
                size="sm"
                variant="outline"
                className="h-6 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        {error && (
          <CardContent className="pt-0">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Real-time Events */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Crypto Events from Kafka</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {cryptoEvents.length} latest events
          </p>
        </CardHeader>
        <CardContent>
          {cryptoEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {connectionStatus
                ? "Waiting for crypto events from Kafka..."
                : "Not connected to Kafka. Please check your connection."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Crypto ID</th>
                    <th className="text-right p-2 font-medium">Avg Price</th>
                    <th className="text-right p-2 font-medium">Market Cap</th>
                    <th className="text-right p-2 font-medium">Rank</th>
                    <th className="text-right p-2 font-medium">Volume</th>
                    <th className="text-right p-2 font-medium">24h High</th>
                    <th className="text-right p-2 font-medium">24h Low</th>
                    <th className="text-right p-2 font-medium">
                      Price Change %
                    </th>
                    <th className="text-right p-2 font-medium">MC Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoEvents.map(
                    (event: KafkaCryptoEvent, index: number) => (
                      <tr
                        key={`${event.cryptocurrency_id}-${index}`}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-2">
                          <Badge variant="outline">
                            ID: {event.cryptocurrency_id}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatNumber(event.avg_price)}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatNumber(event.avg_market_cap)}
                        </td>
                        <td className="p-2 text-right">
                          #{Math.round(event.avg_market_cap_rank)}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatNumber(event.avg_total_volume)}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatNumber(event.avg_high_24h)}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatNumber(event.avg_low_24h)}
                        </td>
                        <td
                          className={`p-2 text-right font-mono ${getPercentageColor(
                            event.avg_price_change_pct
                          )}`}
                        >
                          {formatPercentage(event.avg_price_change_pct)}
                        </td>
                        <td
                          className={`p-2 text-right font-mono ${getPercentageColor(
                            event.avg_market_cap_change_pct
                          )}`}
                        >
                          {formatPercentage(event.avg_market_cap_change_pct)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KafkaCryptoTable;
