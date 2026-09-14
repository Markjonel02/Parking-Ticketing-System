// client/src/utils/formatDate.js
export function formatDate(dateInput, includeTime = true) {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return String(dateInput);
  }
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const now = new Date();
  const date = new Date(dateInput);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
}
