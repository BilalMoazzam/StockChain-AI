const Badge = ({ children, className = "" }) => {
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>
      {children}
    </span>
  );
};

export default Badge; // ✅ default export
