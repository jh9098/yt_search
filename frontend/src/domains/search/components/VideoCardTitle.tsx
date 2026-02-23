import { Fragment } from "react";

interface VideoCardTitleProps {
  title: string;
  keyword: string;
}

function escapeRegExp(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildHighlightPattern(keyword: string): RegExp | null {
  const terms = keyword
    .trim()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .map(escapeRegExp);

  if (terms.length === 0) {
    return null;
  }

  return new RegExp(`(${terms.join("|")})`, "gi");
}

export function VideoCardTitle({ title, keyword }: VideoCardTitleProps) {
  const pattern = buildHighlightPattern(keyword);

  if (!pattern) {
    return <h2 className="result-card-title">{title}</h2>;
  }

  const parts = title.split(pattern);
  return (
    <h2 className="result-card-title">
      {parts.map((part, index) => {
        if (!part) {
          return null;
        }
        const isMatch = pattern.test(part);
        pattern.lastIndex = 0;

        return (
          <Fragment key={`${part}-${index}`}>
            {isMatch ? <span className="keyword-highlight">{part}</span> : part}
          </Fragment>
        );
      })}
    </h2>
  );
}
