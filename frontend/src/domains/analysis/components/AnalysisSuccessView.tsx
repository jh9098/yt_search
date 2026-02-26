import type { AnalysisResult } from "../types";
import type { AnalysisUiText } from "../i18n/analysisUiText.types";
import { AnalysisKeywordChips } from "./AnalysisKeywordChips";

interface AnalysisSuccessViewProps {
  result: AnalysisResult;
  onClose: () => void;
  onKeywordClick: (keyword: string) => void;
  text: AnalysisUiText;
  locale: string;
}

function formatDate(dateString: string, locale: string, invalidDateFallback: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return invalidDateFallback;
  }

  return date.toLocaleString(locale, { hour12: false });
}

export function AnalysisSuccessView({
  result,
  onClose,
  onKeywordClick,
  text,
  locale,
}: AnalysisSuccessViewProps) {
  const contentIdeas = result.contentIdeas ?? [];
  const keywords = result.recommendedKeywords ?? [];
  const warnings = result.meta.warnings ?? [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{text.completedTitle}</h2>

      <div className="mt-4 space-y-3 text-sm text-slate-700">
        <article>
          <h3 className="font-semibold text-slate-900">{text.summarySectionTitle}</h3>
          <p className="mt-1">{result.summary.majorReactions}</p>
        </article>
        <article>
          <h3 className="font-semibold text-slate-900">{text.positiveSectionTitle}</h3>
          <p className="mt-1">{result.summary.positivePoints}</p>
        </article>
        <article>
          <h3 className="font-semibold text-slate-900">{text.weakSectionTitle}</h3>
          <p className="mt-1">{result.summary.weakPoints}</p>
        </article>
      </div>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">{text.contentIdeasTitle}</h3>
        {contentIdeas.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{text.emptyContentIdeasMessage}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {contentIdeas.map((idea) => (
              <li key={idea.title} className="rounded-md bg-slate-50 p-3">
                <p className="font-medium text-slate-900">{idea.title}</p>
                <p className="mt-1 text-sm text-slate-600">{idea.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">{text.recommendedKeywordsTitle}</h3>
        <AnalysisKeywordChips keywords={keywords} onKeywordClick={onKeywordClick} />
      </section>

      <section className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p>{text.metaModelLabel}: {result.meta.model}</p>
        <p>{text.metaAnalyzedAtLabel}: {formatDate(result.meta.analyzedAt, locale, text.invalidDateFallbackMessage)}</p>
        <p>{text.metaAnalysisBasisLabel}: {result.meta.analysisBasis.join(", ") || text.metaUnknownInfoLabel}</p>
        <p>{text.metaAnalysisVersionLabel}: {result.meta.analysisVersion}</p>
        <p>{text.metaSchemaVersionLabel}: {result.meta.schemaVersion}</p>
        {warnings.length > 0 && (
          <p className="mt-1 text-amber-700">{text.metaWarningLabel}: {warnings.join(" / ")}</p>
        )}
      </section>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
      >
        {text.closeButtonLabel}
      </button>
    </section>
  );
}
