import { useState } from "react";
import "./App.css";
import CryptoTable from "./components/CryptoTable";
import PriceChart from "./components/PriceChart";
import KafkaCryptoTable from "./components/KafkaCryptoTable";
import useCryptoData from "./hooks/useCryptoData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card, CardContent } from "./components/ui/card";

function App() {
  const { data, loading, error, refetch } = useCryptoData(30000); // Refresh every 30 seconds
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update the last updated timestamp when data changes
  if (data && (!lastUpdated || new Date(data.last_updated) > lastUpdated)) {
    setLastUpdated(new Date(data.last_updated));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Crypto Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                {lastUpdated ? (
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                ) : (
                  <span>Loading data...</span>
                )}
              </div>
              <button
                onClick={refetch}
                className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded-md text-sm"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="kafka" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="kafka">Real-time Kafka Data</TabsTrigger>
            <TabsTrigger value="static">Static JSON Data</TabsTrigger>
          </TabsList>

          <TabsContent value="kafka" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Live Cryptocurrency Data from Kafka
                </h2>
                <p className="text-muted-foreground mb-4">
                  Real-time cryptocurrency events streamed through Kafka and
                  WebSocket
                </p>
                <KafkaCryptoTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="static" className="space-y-6">
            {error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p>{error}</p>
                <p className="text-sm mt-2">
                  Make sure the crypto_crawler.js script is running and
                  generating the crypto_data.json file.
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-8">
              <PriceChart data={data?.coins || []} isLoading={loading} />

              <CryptoTable data={data?.coins || []} isLoading={loading} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-gray-100 border-t mt-12">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 text-sm">
          <p>Crypto Dashboard Demo - Data from CoinGecko API & Kafka Stream</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
