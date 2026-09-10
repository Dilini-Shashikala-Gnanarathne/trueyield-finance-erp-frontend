interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SegmentedControlProps<T extends string> {
  id: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  'aria-label'?: string;
}

/**
 * Tab-style segmented control for mutually exclusive options (e.g., gRPC vs REST).
 * Keyboard-accessible via role="radiogroup".
 */
export default function SegmentedControl<T extends string>({
  id,
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      id={id}
      className="segmented-control"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        // Determine active class based on the value name
        const activeClass = isActive
          ? option.value === 'GRPC'
            ? 'segmented-control__option segmented-control__option--active-grpc'
            : 'segmented-control__option segmented-control__option--active-rest'
          : 'segmented-control__option';

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={activeClass}
            onClick={() => onChange(option.value)}
            title={option.description}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
