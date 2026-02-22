
---

# 2) `docs/00_project/CHANGELOG_WORKING.md`

```md id="v1w9qb"
# CHANGELOG_WORKING.md

## 목적
이 문서는 "세션 단위 작업 로그"입니다.

`DECISIONS.md`가 중요한 설계 결정을 기록하는 문서라면,
이 문서는 실제로 무엇을 했고, 어디까지 진행됐고, 다음에 무엇부터 시작해야 하는지를 빠르게 복구하기 위한 문서입니다.

새 대화/새 세션에서 가장 먼저 확인하면 좋습니다.

---

## 기록 규칙
- 하루/세션 단위로 기록
- 너무 길게 쓰지 말고 핵심만
- 완료/미완료/막힘/다음 시작점 위주
- 관련 파일 경로를 같이 남기기

---

## 템플릿
```md id="p9fdm1"
## YYYY-MM-DD (세션명/작업명)
### 오늘 목표
- 
- 

### 진행 내용 (완료)
- [x] 
- [x] 

### 진행 내용 (미완료)
- [ ] 
- [ ] 

### 새로 생긴 이슈 / 막힘
- 
- 

### 변경/생성 파일
- `path/to/file1`
- `path/to/file2`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 
2. 
3. 

### 메모
- 작업 로그
2026-02-23 (프로젝트 세팅 / AI 작업 하니스 구축)
오늘 목표

코딩 전에 AI가 읽을 파일 시스템(매뉴얼/기억/품질검사) 구조 확정

복붙 가능한 초기 문서 템플릿 생성

진행 내용 (완료)

 AGENT.md 작성

 SKILLS.md 작성

 docs/00_project/PLAN.md 작성

 docs/00_project/CONTEXT_NOTE.md 작성

 docs/00_project/CHECKLIST.md 작성

 docs/01_manuals/INDEX.md 작성

 docs/01_manuals/backend.md 작성

 docs/01_manuals/frontend.md 작성

 docs/01_manuals/ai-analysis.md 작성

 docs/01_manuals/api-contracts.md 작성

 docs/01_manuals/data.md 작성

 docs/01_manuals/security.md 작성

 docs/01_manuals/qa-checklist.md 작성

 docs/04_quality/done-report-template.md 작성

 docs/04_quality/peer-review-template.md 작성

 docs/00_project/DECISIONS.md 작성

 docs/00_project/CHANGELOG_WORKING.md 작성 (현재 문서)

진행 내용 (미완료)

 docs/03_prompts/output-schema-analysis.json 생성

 docs/03_prompts/examples/analysis-output-sample.json 생성

 docs/00_project/CHECKLIST.md 상태 반영 업데이트

 실제 프로젝트 폴더/파일 생성 및 저장 적용

새로 생긴 이슈 / 막힘

실제 유튜브 데이터 수집 방식(공식 API/기타) 최종 확정 전

댓글 원문 저장 범위 정책(전체/샘플/해시 중심) 확정 필요

변경/생성 파일

AGENT.md

SKILLS.md

docs/00_project/PLAN.md

docs/00_project/CONTEXT_NOTE.md

docs/00_project/CHECKLIST.md

docs/00_project/DECISIONS.md

docs/00_project/CHANGELOG_WORKING.md

docs/01_manuals/INDEX.md

docs/01_manuals/backend.md

docs/01_manuals/frontend.md

docs/01_manuals/ai-analysis.md

docs/01_manuals/api-contracts.md

docs/01_manuals/data.md

docs/01_manuals/security.md

docs/01_manuals/qa-checklist.md

docs/04_quality/done-report-template.md

docs/04_quality/peer-review-template.md

다음 세션 시작점 (가장 먼저 할 일)

docs/03_prompts/output-schema-analysis.json 작성

docs/03_prompts/examples/analysis-output-sample.json 작성

backend/frontend 초기 폴더 구조 생성

분석 API 스키마/프론트 타입 정의 시작

메모

현재는 "코딩 전 세팅" 단계가 핵심이므로 문서 기반 정렬에 집중함

다음부터는 기능 단위로 문서 + 코드 병행 진행 권장


---

# 3) `docs/03_prompts/output-schema-analysis.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "analysis-result-v1",
  "title": "AI Content Material Analysis Result",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "summary",
    "contentIdeas",
    "recommendedKeywords",
    "meta"
  ],
  "properties": {
    "summary": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "majorReactions",
        "positivePoints",
        "weakPoints"
      ],
      "properties": {
        "majorReactions": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000,
          "description": "댓글/반응의 핵심 요약 (사실 기반 요약 중심)"
        },
        "positivePoints": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000,
          "description": "좋게 반응한 포인트 요약"
        },
        "weakPoints": {
          "type": "string",
          "minLength": 1,
          "maxLength": 1000,
          "description": "아쉬운 점 또는 보완 포인트 요약"
        }
      }
    },
    "contentIdeas": {
      "type": "array",
      "description": "AI 제안 기반 후속 콘텐츠 아이디어 목록",
      "maxItems": 10,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "title",
          "description"
        ],
        "properties": {
          "title": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "description": {
            "type": "string",
            "minLength": 1,
            "maxLength": 1000
          }
        }
      }
    },
    "recommendedKeywords": {
      "type": "array",
      "description": "재검색/확장 탐색용 추천 키워드",
      "maxItems": 12,
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50
      }
    },
    "meta": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "model",
        "analyzedAt",
        "analysisBasis",
        "analysisVersion",
        "schemaVersion"
      ],
      "properties": {
        "model": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100
        },
        "analyzedAt": {
          "type": "string",
          "format": "date-time"
        },
        "commentSampleCount": {
          "type": "integer",
          "minimum": 0
        },
        "analysisBasis": {
          "type": "array",
          "minItems": 1,
          "maxItems": 10,
          "items": {
            "type": "string",
            "enum": [
              "title",
              "description",
              "comments",
              "transcript",
              "thumbnail_ocr",
              "channel_meta"
            ]
          }
        },
        "languageSummary": {
          "type": "array",
          "maxItems": 10,
          "items": {
            "type": "string",
            "minLength": 2,
            "maxLength": 10
          }
        },
        "cacheHit": {
          "type": "boolean"
        },
        "analysisVersion": {
          "type": "string",
          "pattern": "^v[0-9]+$"
        },
        "schemaVersion": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100
        },
        "warnings": {
          "type": "array",
          "maxItems": 20,
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 300
          }
        }
      }
    }
  }
}
4) docs/03_prompts/examples/analysis-output-sample.json
{
  "summary": {
    "majorReactions": "댓글에서는 가족 관계에서 반복되는 상처 주는 말에 대한 공감 반응이 많고, 자신의 경험을 공유하며 원인을 이해하려는 반응이 두드러집니다. 특히 감정적으로 반응한 뒤 후회했다는 사례와 부모-자녀/부부 대화 문제를 연결하는 의견이 자주 보입니다.",
    "positivePoints": "뇌과학·심리 관점으로 문제를 설명해 '내 탓만이 아니라 이해 가능한 패턴'으로 받아들이게 해준 점에 긍정 반응이 많습니다. 설명이 쉽고 실제 상황에 적용해볼 수 있는 힌트를 얻었다는 평가도 있습니다.",
    "weakPoints": "일부 댓글에서는 해결 방법이 다소 추상적이고, 상황별 대화 예시가 더 있었으면 좋겠다는 반응이 있습니다. 특정 가족 유형(부부/부모-성인자녀 등)별로 나눈 설명이 부족하다는 의견도 보입니다."
  },
  "contentIdeas": [
    {
      "title": "가족에게 상처 주는 말을 줄이는 3단계 대화법 (뇌과학 기반)",
      "description": "공감 반응이 많았던 '후회되는 말' 패턴을 중심으로, 감정 폭발 직전 멈추는 신호-표현 전환-사후 회복 대화를 3단계로 정리하는 후속 콘텐츠."
    },
    {
      "title": "왜 가족에게만 예민해질까? 관계별 감정 트리거 분석",
      "description": "부부, 부모-자녀, 형제자매 관계에서 자주 발생하는 감정 트리거를 분리해 설명하고, 댓글 사례를 일반화한 실전 대응 팁을 제공하는 콘텐츠."
    },
    {
      "title": "사과해도 관계가 회복되지 않는 이유: 말투보다 중요한 것",
      "description": "댓글 속 반복된 '사과했는데도 서운함이 남는다' 반응을 바탕으로, 말의 내용보다 전달 방식과 타이밍이 중요한 이유를 설명하는 콘텐츠."
    }
  ],
  "recommendedKeywords": [
    "가족관계",
    "가족 대화법",
    "감정조절",
    "부부 소통",
    "부모자녀 관계",
    "뇌과학 심리",
    "상처 주는 말",
    "관계 회복"
  ],
  "meta": {
    "model": "gemini-2.0-flash",
    "analyzedAt": "2026-02-23T09:00:00Z",
    "commentSampleCount": 320,
    "analysisBasis": [
      "title",
      "description",
      "comments"
    ],
    "languageSummary": [
      "ko"
    ],
    "cacheHit": false,
    "analysisVersion": "v1",
    "schemaVersion": "analysis-result-v1",
    "warnings": []
  }
}
