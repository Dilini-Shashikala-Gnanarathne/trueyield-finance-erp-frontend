import type { FinanceTransport } from '@/api/types';

interface TransportBadgeProps {
  transport: FinanceTransport | string;
}

export default function TransportBadge({ transport }: TransportBadgeProps) {
  const isGrpc = transport === 'GRPC';
  const className = isGrpc
    ? 'transport-badge transport-badge--grpc'
    : 'transport-badge transport-badge--rest';

  return (
    <span className={className}>
      {isGrpc ? '⚡' : '🌐'} {transport}
    </span>
  );
}
