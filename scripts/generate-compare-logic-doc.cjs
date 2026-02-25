const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

// 테이블 셀 스타일
const cellStyle = {
  borders: {
    top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
  },
  margins: {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  },
};

// 헤더 셀 스타일
const headerCellStyle = {
  ...cellStyle,
  shading: { fill: 'd64f79' },
};

// 테이블 생성 헬퍼
function createTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(h => new TableCell({
          ...headerCellStyle,
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', font: 'Malgun Gothic' })],
            alignment: AlignmentType.CENTER,
          })],
        })),
      }),
      ...rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          ...cellStyle,
          children: [new Paragraph({
            children: [new TextRun({ text: cell, font: 'Malgun Gothic', size: 20 })],
          })],
        })),
      })),
    ],
  });
}

// 코드 블록 생성
function createCodeBlock(code) {
  return code.split('\n').map(line =>
    new Paragraph({
      children: [new TextRun({
        text: line || ' ',
        font: 'Consolas',
        size: 18,
        color: '2d2640',
      })],
      shading: { fill: 'f5f5f5' },
      spacing: { before: 0, after: 0 },
    })
  );
}

// 문서 생성
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // 제목
      new Paragraph({
        children: [new TextRun({
          text: 'ETF 비교하기 - 정규화 로직 정의서',
          bold: true,
          size: 36,
          font: 'Malgun Gothic',
          color: 'd64f79',
        })],
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
      }),

      // 1. 개요
      new Paragraph({
        children: [new TextRun({ text: '1. 개요', bold: true, size: 28, font: 'Malgun Gothic' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'ETF 비교 기능은 서로 다른 단위와 범위를 가진 지표들을 동일한 척도(1~10점)로 변환하여 레이더 차트에 시각화합니다.',
          font: 'Malgun Gothic',
          size: 22,
        })],
        spacing: { after: 200 },
      }),

      // 2. 정규화 대상 지표
      new Paragraph({
        children: [new TextRun({ text: '2. 정규화 대상 지표 (6개)', bold: true, size: 28, font: 'Malgun Gothic' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      createTable(
        ['지표명', '코드 Key', '평가 방향', '설명'],
        [
          ['비용효율', 'ter', '낮을수록 좋음', '총보수율 (연간 비용)'],
          ['가격정확도', 'discrepancy', '낮을수록 좋음', '괴리율 (NAV 대비 시장가 차이, 절대값 사용)'],
          ['거래효율', 'spread', '낮을수록 좋음', '스프레드 (매수/매도 호가 차이)'],
          ['AUM', 'aum', '높을수록 좋음', '순자산총액'],
          ['거래대금', 'adtv', '높을수록 좋음', '30일 평균 거래대금'],
          ['추적정확도', 'trackingError', '낮을수록 좋음', '추적오차 (지수 추종 정확도)'],
        ]
      ),

      // 3. 정규화 공식
      new Paragraph({
        children: [new TextRun({ text: '3. 정규화 공식', bold: true, size: 28, font: 'Malgun Gothic' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [new TextRun({ text: '3-1. 기본 공식', bold: true, size: 24, font: 'Malgun Gothic' })],
        spacing: { before: 200, after: 100 },
      }),
      ...createCodeBlock('정규화값 = (원본값 - 최소값) / (최대값 - 최소값)\n         → 결과: 0 ~ 1 범위'),

      new Paragraph({
        children: [new TextRun({ text: '3-2. 1~10점 스케일 변환', bold: true, size: 24, font: 'Malgun Gothic' })],
        spacing: { before: 300, after: 100 },
      }),
      ...createCodeBlock('점수 = 정규화값 × 9 + 1\n     → 결과: 1 ~ 10점 범위'),

      new Paragraph({
        children: [new TextRun({ text: '3-3. 평가 방향에 따른 처리', bold: true, size: 24, font: 'Malgun Gothic' })],
        spacing: { before: 300, after: 100 },
      }),
      createTable(
        ['방향', '계산 방식', '예시'],
        [
          ['낮을수록 좋음', '(1 - 정규화값) × 9 + 1', 'TER 0.05%가 0.30%보다 높은 점수'],
          ['높을수록 좋음', '정규화값 × 9 + 1', 'AUM 1조원이 1000억보다 높은 점수'],
        ]
      ),

      // 4. 핵심 규칙
      new Paragraph({
        children: [new TextRun({ text: '4. 핵심 규칙', bold: true, size: 28, font: 'Malgun Gothic' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [new TextRun({ text: '규칙 1: 상대 비교', bold: true, size: 24, font: 'Malgun Gothic', color: 'd64f79' })],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: '모든 점수는 현재 비교 중인 ETF들 사이에서만 계산됩니다.',
          font: 'Malgun Gothic',
          size: 22,
        })],
        spacing: { after: 100 },
      }),
      ...createCodeBlock('예시: A, B, C 3개 ETF 비교 시\n\nTER 값:  A=0.05%,  B=0.15%,  C=0.30%\n         ↓\n최소값 = 0.05 (A)\n최대값 = 0.30 (C)\n         ↓\nA 점수 = 10점 (가장 낮으므로 최고점)\nB 점수 = 5.5점 (중간)\nC 점수 = 1점 (가장 높으므로 최저점)'),

      new Paragraph({
        children: [new TextRun({ text: '규칙 2: 1개만 비교 시 → 만점(중간값)', bold: true, size: 24, font: 'Malgun Gothic', color: 'd64f79' })],
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: '비교 대상이 1개뿐이면 최소값 = 최대값이 됩니다.',
          font: 'Malgun Gothic',
          size: 22,
        })],
        spacing: { after: 100 },
      }),
      ...createCodeBlock('조건: 최소값 === 최대값\n결과: 무조건 5.5점 반환 (모든 지표 동일)'),
      new Paragraph({
        children: [new TextRun({
          text: '※ 참고: 현재 UI에서는 2개 이상 선택해야 레이더 차트가 표시됩니다.',
          font: 'Malgun Gothic',
          size: 20,
          italics: true,
          color: '666666',
        })],
        spacing: { before: 100, after: 100 },
      }),

      new Paragraph({
        children: [new TextRun({ text: '규칙 3: 괴리율은 절대값 사용', bold: true, size: 24, font: 'Malgun Gothic', color: 'd64f79' })],
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: '괴리율은 +/-와 무관하게 NAV와의 차이 크기가 중요합니다.',
          font: 'Malgun Gothic',
          size: 22,
        })],
        spacing: { after: 100 },
      }),
      ...createCodeBlock('예시:\n괴리율 +0.5% → |0.5| = 0.5\n괴리율 -0.3% → |-0.3| = 0.3\n\n→ -0.3%가 더 좋은 점수 (절대값이 작으므로)'),

      // 5. 코드 구현
      new Paragraph({
        children: [new TextRun({ text: '5. 코드 구현 (핵심 함수)', bold: true, size: 28, font: 'Malgun Gothic' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      ...createCodeBlock(`// 상대 비교 정규화 함수
const getRelativeScore = (
  value: number,           // 해당 ETF의 지표값
  allValues: number[],     // 비교군 전체 지표값 배열
  lowerIsBetter: boolean   // true: 낮을수록 좋음
): number => {
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)

  // 모든 값이 같으면 중간값 반환
  if (min === max) return 5.5

  // 0~1 정규화
  const normalized = (value - min) / (max - min)

  // 1~10 스케일 변환 (방향 적용)
  const score = lowerIsBetter
    ? (1 - normalized) * 9 + 1   // 낮을수록 높은 점수
    : normalized * 9 + 1          // 높을수록 높은 점수

  return score
}`),

      // 6. 실제 계산 예시
      new Paragraph({
        children: [new TextRun({ text: '6. 실제 계산 예시', bold: true, size: 28, font: 'Malgun Gothic' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: '비교 대상: KODEX 200, TIGER 200, KBSTAR 200',
          font: 'Malgun Gothic',
          size: 22,
          bold: true,
        })],
        spacing: { after: 100 },
      }),
      createTable(
        ['지표', 'KODEX 200', 'TIGER 200', 'KBSTAR 200', '방향'],
        [
          ['TER', '0.05%', '0.07%', '0.04%', '낮을수록 좋음'],
          ['괴리율', '-0.02%', '+0.05%', '-0.01%', '낮을수록 좋음'],
          ['AUM', '5조원', '3조원', '1조원', '높을수록 좋음'],
        ]
      ),

      new Paragraph({
        children: [new TextRun({ text: 'TER 점수 계산:', bold: true, size: 22, font: 'Malgun Gothic' })],
        spacing: { before: 200, after: 100 },
      }),
      ...createCodeBlock('최소 = 0.04, 최대 = 0.07, 범위 = 0.03\n\nKODEX:  (0.05-0.04)/0.03 = 0.33 → (1-0.33)×9+1 = 7.0점\nTIGER:  (0.07-0.04)/0.03 = 1.00 → (1-1.00)×9+1 = 1.0점\nKBSTAR: (0.04-0.04)/0.03 = 0.00 → (1-0.00)×9+1 = 10.0점'),

      new Paragraph({
        children: [new TextRun({ text: '괴리율 점수 계산 (절대값):', bold: true, size: 22, font: 'Malgun Gothic' })],
        spacing: { before: 200, after: 100 },
      }),
      ...createCodeBlock('절대값: 0.02, 0.05, 0.01\n최소 = 0.01, 최대 = 0.05, 범위 = 0.04\n\nKODEX:  (0.02-0.01)/0.04 = 0.25 → (1-0.25)×9+1 = 7.75점\nTIGER:  (0.05-0.01)/0.04 = 1.00 → (1-1.00)×9+1 = 1.0점\nKBSTAR: (0.01-0.01)/0.04 = 0.00 → (1-0.00)×9+1 = 10.0점'),

      // 7. 우위 항목 계산 로직
      new Paragraph({
        children: [new TextRun({ text: '7. 우위 항목 계산 로직', bold: true, size: 28, font: 'Malgun Gothic' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: '레이더 차트 아래 "비교 요약"에서 각 ETF의 우위 항목 수를 계산합니다.',
          font: 'Malgun Gothic',
          size: 22,
        })],
        spacing: { after: 100 },
      }),
      ...createCodeBlock(`// 6개 지표 각각에서 1위 판정
radarMetrics.forEach(metric => {
  const allValues = selectedETFs.map(e => getMetricValue(e, metric))
  const etfValue = getMetricValue(etf, metric)

  // 1위 = 해당 방향의 최적값과 일치
  const bestValue = metric.lowerIsBetter
    ? Math.min(...allValues)  // 낮을수록 좋음 → 최소값이 1위
    : Math.max(...allValues)  // 높을수록 좋음 → 최대값이 1위

  if (etfValue === bestValue) {
    ranks.first++  // 1위 개수 증가
  }
})`),

      // 8. 요약
      new Paragraph({
        children: [new TextRun({ text: '8. 요약', bold: true, size: 28, font: 'Malgun Gothic' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      createTable(
        ['항목', '규칙'],
        [
          ['점수 범위', '1점(최악) ~ 10점(최고)'],
          ['비교 기준', '선택된 ETF들 간 상대 비교'],
          ['1개 선택 시', '모든 지표 5.5점 (비교 불가)'],
          ['동일 값', '같은 점수 부여'],
          ['괴리율', '절대값으로 변환 후 계산'],
          ['방향', '6개 중 4개는 "낮을수록 좋음"'],
        ]
      ),

      // 문서 정보
      new Paragraph({
        children: [new TextRun({
          text: '\n\n문서 생성일: ' + new Date().toLocaleDateString('ko-KR'),
          font: 'Malgun Gothic',
          size: 18,
          color: '999999',
        })],
        spacing: { before: 400 },
        alignment: AlignmentType.RIGHT,
      }),
    ],
  }],
});

// 파일 저장
const outputPath = path.join(__dirname, '..', 'docs', 'ETF_비교_정규화_로직_정의서.docx');

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log('Word 파일 생성 완료:', outputPath);
}).catch((err) => {
  console.error('파일 생성 실패:', err);
});
