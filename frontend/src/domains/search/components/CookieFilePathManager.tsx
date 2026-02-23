type CookieFilePathManagerProps = {
  value: string;
  onSave: (cookieFilePath: string) => void;
};

export function CookieFilePathManager({ value, onSave }: CookieFilePathManagerProps) {
  return (
    <section className="api-key-manager" aria-label="쿠키 파일 경로 설정">
      <div className="api-key-manager-header">
        <p className="api-key-manager-title">cookies_netscape.txt 경로</p>
        <p className="api-key-manager-summary">{value ? "설정됨" : "미설정"}</p>
      </div>
      <div className="api-key-editor-wrap">
        <input
          className="search-input"
          value={value}
          onChange={(event) => {
            onSave(event.target.value);
          }}
          placeholder="예) /Users/me/cookies_netscape.txt"
          aria-label="쿠키 파일 경로"
        />
        <p className="api-key-manager-help">서버가 접근 가능한 로컬 경로를 입력해 주세요. 필요 없으면 비워두셔도 됩니다.</p>
      </div>
    </section>
  );
}
