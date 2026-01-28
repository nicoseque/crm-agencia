import { useEffect, useState } from "react";
import SalesBySellerRanking from "../components/dashboard/SalesBySellerRanking";
import { getSalesBySeller } from "../services/metrics.service";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const data = await getSalesBySeller();
        setRanking(data || []);
      } catch (err) {
        setError("Error al cargar el ranking");
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  if (loading) {
    return <p>Cargando ranking...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return <SalesBySellerRanking data={ranking} />;
}
