interface AnalysisKeywordChipsProps {
  keywords: string[];
  onKeywordClick: (keyword: string) => void;
}

export function AnalysisKeywordChips({
  keywords,
  onKeywordClick,
}: AnalysisKeywordChipsProps) {
  if (keywords.length === 0) {
    return <p className="mt-2 text-sm text-slate-500">추천 키워드가 없습니다.</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <button
          key={keyword}
          type="button"
          onClick={() => onKeywordClick(keyword)}
          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
        >
          {keyword}
        </button>
      ))}
    </div>
  );
}
