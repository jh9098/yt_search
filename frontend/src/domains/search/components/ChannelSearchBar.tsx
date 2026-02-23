interface ChannelSearchBarProps {
  channel: string;
  isDisabled: boolean;
  onChannelChange: (value: string) => void;
  onSearch: () => void;
}

export function ChannelSearchBar({
  channel,
  isDisabled,
  onChannelChange,
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
          placeholder="예: 마음연구소"
          aria-label="채널명 입력"
        />
        <button type="button" onClick={onSearch} disabled={isDisabled} aria-label="채널명 검색 실행">
          검색
        </button>
      </div>
    </div>
  );
}
