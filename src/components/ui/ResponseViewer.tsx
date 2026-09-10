interface ResponseViewerProps {
  data: unknown;
  isSuccess?: boolean;
  isError?: boolean;
  statusLabel?: string;
}

export default function ResponseViewer({
  data,
  isSuccess = true,
  isError = false,
  statusLabel,
}: ResponseViewerProps) {
  const formatted = JSON.stringify(data, null, 2);
  const statusClass = isError
    ? 'response-viewer__status response-viewer__status--error'
    : 'response-viewer__status response-viewer__status--success';

  return (
    <div className="response-viewer animate-in">
      <div className="response-viewer__header">
        <span className="response-viewer__title">📄 Response</span>
        {statusLabel && (
          <span className={statusClass}>{statusLabel}</span>
        )}
      </div>
      <pre className="response-viewer__body" aria-label="JSON response">
        {formatted}
      </pre>
    </div>
  );
}
