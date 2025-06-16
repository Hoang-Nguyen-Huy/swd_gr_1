import { useState, useEffect } from "react";
import axios from "axios";
import { CryptoDataResponse } from "../types/crypto";

const DEFAULT_REFRESH_INTERVAL = 60000;
const API_URL = import.meta.env.VITE_API_URL || "/crypto_data.json";
const REFRESH_INTERVAL =
  Number(import.meta.env.VITE_REFRESH_INTERVAL) || DEFAULT_REFRESH_INTERVAL;

const useCryptoData = (refreshInterval = REFRESH_INTERVAL) => {
  const [data, setData] = useState<CryptoDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<CryptoDataResponse>(API_URL);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching crypto data:", err);
      setError("Failed to fetch crypto data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up polling for regular updates
    const intervalId = setInterval(fetchData, refreshInterval);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

export default useCryptoData;
