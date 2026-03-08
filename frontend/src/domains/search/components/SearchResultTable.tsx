import { useMemo, useState } from "react";
import type { SearchUiText } from "../i18n/searchUiText.types";
import type { SearchResultCard, SearchTableSortKey } from "../types";
import { truncateText } from "../utils/text";

interface SearchResultTableProps {
  cards: SearchResultCard[];
  searchUiText: SearchUiText;
}

type SortDirection = "asc" | "desc";

function getSortValue(card: SearchResultCard, key: SearchTableSortKey): number | string {
  switch (key) {
    case "title":
      return card.title.toLowerCase();
    case "channelName":
      return card.channelName.toLowerCase();
    case "publishedDateText":
      return card.publishedDateText;
    case "viewCount":
      return card.viewCount;
    case "subscriberCount":
      return card.subscriberCount;
    case "channelPublishedDateText":
      return card.channelPublishedDateText;
    case "totalVideoCount":
      return Number(card.totalVideoCountText.replace(/[^0-9]/g, "")) || 0;
    case "subscriptionRate":
      return Number(card.subscriptionRateText.replace(/[^0-9.]/g, "")) || 0;
    case "annualSubscriberGrowth":
      return Number(card.annualSubscriberGrowthText.replace(/[^0-9]/g, "")) || 0;
    case "uploadsPerWeek":
      return Number(card.uploadsPerWeekText.replace(/[^0-9.]/g, "")) || 0;
    case "countryCode":
      return card.countryCode;
    case "channelGrade":
      return card.channelGrade;
    case "performanceScore":
      return card.performanceScore;
    case "exposureScore":
      return card.exposureScore;
    case "isHotVideo":
      return card.isHotVideo ? 1 : 0;
    default:
      return card.title;
  }
}

export function SearchResultTable({ cards, searchUiText }: SearchResultTableProps) {
  const [sortKey, setSortKey] = useState<SearchTableSortKey>("subscriberCount");
  const [direction, setDirection] = useState<SortDirection>("asc");

  const columns: Array<{ key: SearchTableSortKey; label: string }> = useMemo(
    () => [
      { key: "title", label: searchUiText.searchResultTable.columns.title },
      { key: "channelName", label: searchUiText.searchResultTable.columns.channelName },
      { key: "publishedDateText", label: searchUiText.searchResultTable.columns.publishedDateText },
      { key: "viewCount", label: searchUiText.searchResultTable.columns.viewCount },
      { key: "subscriberCount", label: searchUiText.searchResultTable.columns.subscriberCount },
      {
        key: "channelPublishedDateText",
        label: searchUiText.searchResultTable.columns.channelPublishedDateText,
      },
      { key: "totalVideoCount", label: searchUiText.searchResultTable.columns.totalVideoCount },
      { key: "subscriptionRate", label: searchUiText.searchResultTable.columns.subscriptionRate },
      {
        key: "annualSubscriberGrowth",
        label: searchUiText.searchResultTable.columns.annualSubscriberGrowth,
      },
      { key: "uploadsPerWeek", label: searchUiText.searchResultTable.columns.uploadsPerWeek },
      { key: "countryCode", label: searchUiText.searchResultTable.columns.countryCode },
      { key: "channelGrade", label: searchUiText.searchResultTable.columns.channelGrade },
      { key: "performanceScore", label: searchUiText.searchResultTable.columns.performanceScore },
      { key: "exposureScore", label: searchUiText.searchResultTable.columns.exposureScore },
      { key: "isHotVideo", label: searchUiText.searchResultTable.columns.isHotVideo },
    ],
    [searchUiText],
  );

  const sortedCards = useMemo(() => {
    const copied = [...cards];
    copied.sort((left, right) => {
      const leftValue = getSortValue(left, sortKey);
      const rightValue = getSortValue(right, sortKey);

      if (leftValue < rightValue) {
        return direction === "asc" ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return direction === "asc" ? 1 : -1;
      }

      return 0;
    });

    return copied;
  }, [cards, direction, sortKey]);

  const handleSort = (nextKey: SearchTableSortKey) => {
    if (nextKey === sortKey) {
      setDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setDirection(nextKey === "subscriberCount" ? "asc" : "desc");
  };

  return (
    <div className="result-table-wrap">
      <table className="result-table" aria-label={searchUiText.searchResultTable.tableAriaLabel}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                <button type="button" className="table-sort-button" onClick={() => handleSort(column.key)}>
                  {column.label}
                  {sortKey === column.key ? (direction === "asc" ? " ▲" : " ▼") : ""}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedCards.map((card) => (
            <tr key={card.videoId}>
              <td title={card.title}>
                <a
                  href={`https://www.youtube.com/watch?v=${card.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="table-video-link"
                >
                  {truncateText(card.title, 30)}
                </a>
              </td>
              <td title={card.channelName}>{truncateText(card.channelName, 15)}</td>
              <td>{card.publishedDateText}</td>
              <td>{card.viewCountText}</td>
              <td>{card.subscriberCountText}</td>
              <td>{card.channelPublishedDateText}</td>
              <td>{card.totalVideoCountText}</td>
              <td>{card.subscriptionRateText}</td>
              <td>{card.annualSubscriberGrowthText}</td>
              <td>{card.uploadsPerWeekText}</td>
              <td>{card.countryCode}</td>
              <td>{card.channelGrade}</td>
              <td>{card.performanceScore.toFixed(1)}</td>
              <td>{card.exposureScore.toFixed(1)}</td>
              <td>{card.isHotVideo ? "🔥" : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
