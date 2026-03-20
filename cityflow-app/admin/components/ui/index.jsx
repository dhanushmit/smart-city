// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    slate: 'bg-slate-100 text-slate-600',
    purple: 'bg-purple-100 text-purple-700',
  };
  const sizes = { xs: 'px-2 py-0.5 text-xs', sm: 'px-2.5 py-1 text-xs', md: 'px-3 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60 hover:shadow-[0_12px_48px_rgba(30,58,138,0.06)] transition-all duration-500 overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', type = 'button' }) {
  const variants = {
    primary: 'bg-[#1e3a8a] hover:bg-[#1e40af] text-white shadow-[0_8px_20px_rgba(30,58,138,0.2)]',
    secondary: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-[0_8px_20px_rgba(239,68,68,0.2)]',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-blue-500 hover:text-blue-600',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)]',
  };
  const sizes = { sm: 'px-4 py-2 text-xs', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-[18px] transition-all
        disabled:opacity-50 disabled:cursor-not-allowed scale-100 active:scale-95
        ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    Submitted: 'bg-gray-100 text-gray-700',
    Assigned: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    Resolved: 'bg-green-100 text-green-700',
    Closed: 'bg-slate-100 text-slate-600',
    Active: 'bg-green-100 text-green-700',
    'On Leave': 'bg-orange-100 text-orange-700',
  };
  const dotMap = {
    Resolved: 'bg-green-500', Active: 'bg-green-500',
    'In Progress': 'bg-yellow-500', Assigned: 'bg-blue-500',
    'On Leave': 'bg-orange-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[status] || 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

// ── PriorityBadge ─────────────────────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-orange-100 text-orange-700',
    Low: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${map[priority] || 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  );
}
