import { ArrowLeft } from "lucide-react";

function MobileBackHeader({ title, onBack }) {
  return (
    <div className="mobile-back-header">
      <button className="mobile-back-btn" onClick={onBack} aria-label="Go back">
        <ArrowLeft size={20} />
      </button>
      <h2>{title}</h2>
    </div>
  );
}

export default MobileBackHeader;
