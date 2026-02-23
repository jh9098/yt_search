import type { SearchTopicOption } from "../types";

interface ChannelSearchBarProps {
  channel: string;
  topic: SearchTopicOption;
  isDisabled: boolean;
  onChannelChange: (value: string) => void;
  onTopicChange: (value: SearchTopicOption) => void;
  onSearch: () => void;
}

const TOPIC_OPTIONS: Array<{ value: SearchTopicOption; label: string }> = [
  { value: "all", label: "전체" },
  { value: "shopping", label: "쇼핑(공구/꿀템)" },
  { value: "clip", label: "짤(유명/명장면)" },
  { value: "game", label: "게임(플레이/소식)" },
  { value: "food", label: "요리/먹방(ASMR)" },
  { value: "animal", label: "동물(귀요미)" },
  { value: "knowledge", label: "지식/상식(1분공부)" },
  { value: "beauty", label: "뷰티/패션(OOTD)" },
  { value: "sports", label: "스포츠/운동(헬스)" },
  { value: "entertainment", label: "연예/아이돌(K-pop)" },
  { value: "other", label: "기타" },
];

export function ChannelSearchBar({
  channel,
  topic,
  isDisabled,
  onChannelChange,
  onTopicChange,
  onSearch,
}: ChannelSearchBarProps) {
  return (
    <div className="search-input-group" aria-label="채널명 검색 영역">
      <label htmlFor="channel-search-input" className="search-label">
        채널명 검색
      </label>
      <div className="search-input-row">
        <input
          id="channel-search-input"
          className="search-input"
          value={channel}
          onChange={(event) => onChannelChange(event.target.value)}
          placeholder="예: 백호사연극장"
          aria-label="채널명 입력"
        />
        <button type="button" onClick={onSearch} disabled={isDisabled} aria-label="채널명 검색 실행">
          채널 검색
        </button>
        <select
          className="search-select"
          value={topic}
          disabled={isDisabled}
          onChange={(event) => onTopicChange(event.target.value as SearchTopicOption)}
          aria-label="주제 선택"
        >
          {TOPIC_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
