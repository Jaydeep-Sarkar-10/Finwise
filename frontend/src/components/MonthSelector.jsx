import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

function MonthSelector({
  selectedMonth,
  onChangeMonth,
  availableMonths = [],
}) {
  const currentMonthStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  })();

  const activeMonth = selectedMonth || currentMonthStr;

  const formatMonthTitle = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  const handlePrev = () => {
    const [year, month] = activeMonth.split("-").map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
    onChangeMonth(prevStr);
  };

  const handleNext = () => {
    const [year, month] = activeMonth.split("-").map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    onChangeMonth(nextStr);
  };

  const isCurrentMonth = activeMonth === currentMonthStr;

  // Build selectable options including available months + current month
  const optionsSet = new Set([currentMonthStr, activeMonth, ...availableMonths]);
  const sortedOptions = Array.from(optionsSet).sort().reverse();

  return (
    <div className="month-selector-bar">
      <div className="month-selector-controls">
        <button
          type="button"
          className="month-nav-btn"
          onClick={handlePrev}
          title="Previous Month"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="month-selector-dropdown-wrapper">
          <Calendar size={16} className="month-calendar-icon" />
          <select
            className="month-select"
            value={activeMonth}
            onChange={(e) => onChangeMonth(e.target.value)}
          >
            {sortedOptions.map((m) => (
              <option key={m} value={m}>
                {formatMonthTitle(m)} {m === currentMonthStr ? "(Current)" : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="month-nav-btn"
          onClick={handleNext}
          title="Next Month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          type="button"
          className="current-month-badge-btn"
          onClick={() => onChangeMonth(currentMonthStr)}
        >
          Jump to Current Month
        </button>
      )}
    </div>
  );
}

export default MonthSelector;
