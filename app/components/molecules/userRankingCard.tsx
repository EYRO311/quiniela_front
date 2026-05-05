// src/components/molecules/UserRankingCard.tsx

import Card from '@/app/components/atoms/card';
import Badge from '@/app/components/atoms/badge';

interface UserRankingCardProps {
  username: string;
  puntosTotales: number;
  posicionGeneral: number;
  quinielasActivas: number;
}

export default function UserRankingCard({
  username,
  puntosTotales,
  posicionGeneral,
  quinielasActivas,
}: UserRankingCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-100">Bienvenido</p>
          <h2 className="text-2xl font-bold">@{username}</h2>
        </div>

        <Badge variant="info">Ranking</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-blue-100">Puntos totales</p>
          <p className="text-3xl font-bold">{puntosTotales}</p>
        </div>

        <div>
          <p className="text-sm text-blue-100">Posición general</p>
          <p className="text-3xl font-bold">#{posicionGeneral}</p>
        </div>

        <div>
          <p className="text-sm text-blue-100">Quinielas activas</p>
          <p className="text-3xl font-bold">{quinielasActivas}</p>
        </div>
      </div>
    </Card>
  );
}