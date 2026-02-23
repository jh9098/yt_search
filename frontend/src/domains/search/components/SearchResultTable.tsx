import { useMemo, useState } from "react";
import type { SearchResultCard, SearchTableSortKey } from "../types";
import { truncateText } from "../utils/text";

interface SearchResultTableProps {
  cards: SearchResultCard[];
}

type SortDirection = "asc" | "desc";

const COLUMNS: Array<{ key: SearchTableSortKey; label: string }> = [
  { key: "title", label: "제목" },
  { key: "channelName", label: "채널" },
  { key: "publishedDateText", label: "영상 게시일" },
  { key: "viewCount", label: "조회수" },
  { key: "subscriberCount", label: "구독자" },
  { key: "channelPublishedDateText", label: "채널 개설일" },
  { key: "totalVideoCount", label: "총 영상 수" },
  { key: "subscriptionRate", label: "구독률" },
  { key: "annualSubscriberGrowth", label: "연간 성장" },
  { key: "uploadsPerWeek", label: "업로드 빈도" },
  { key: "countryCode", label: "국가" },
  { key: "channelGrade", label: "등급" },
];

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
    default:
      return card.title;
  }
}

export function SearchResultTable({ cards }: SearchResultTableProps) {
  const [sortKey, setSortKey] = useState<SearchTableSortKey>("subscriberCount");
  const [direction, setDirection] = useState<SortDirection>("asc");

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
      <table className="result-table" aria-label="검색 결과 테이블">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
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
              <td title={card.title}><a href={`https://www.youtube.com/watch?v=${card.videoId}`} target="_blank" rel="noreferrer" className="table-video-link">{truncateText(card.title, 30)}</a></td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
