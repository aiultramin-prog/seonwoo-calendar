/* =========================================================================
 * [선우 선물용 커스터마이징 설정 영역 — APP_CONFIG]
 * 선우에게 선물하기 전, 아래 값만 수정하면 앱 이름·선물 카드·테마·기념일이 즉시 반영됩니다.
 * ========================================================================= */
const APP_CONFIG = {
  // 1. 앱 표시 이름 (상단 배지 및 아이폰 홈 화면 타이틀에 반영)
  appTitle: '빨간달력',

  // 2. 선물 대상 이름 (미확정 시 빈 문자열 '' 가능)
  recipientName: '선우',

  // 3. 초기 환영 / 선물 메시지 카드 설정 (원치 않으면 enabled: false 로 변경)
  giftWelcome: {
    enabled: false, // 선물 문구 확정 후 true 로 바꾸면 첫 실행 시 선물 카드와 상단 🎁 아이콘이 활성화됩니다.
    title: '선우를 위한 전용 달력',
    message: '광고 없이 깔끔하게 날짜만 눌러 바로 기록할 수 있는 달력을 준비했어.\n기분 좋은 날들로 가득 채워지길 바랄게!',
    sender: '' // 예: 'From. OO'
  },

  // 4. 기본 포인트 컬러 테마 ('classicRed' | 'coralRose' | 'peachAmber' | 'forestMint' | 'royalBlue' | 'plumViolet')
  defaultTheme: 'classicRed',

  // 5. 커스텀 홈 화면 아이콘 이미지 경로
  // 비워두면('') 앱이 자동으로 선명한 180x180 PNG 홈 화면 아이콘을 생성합니다.
  // 직접 만든 이미지를 쓰려면 저장소에 파일 업로드 후 './apple-touch-icon.png' 로 입력하세요.
  customIconPath: '',

  // 6. 기본 음력 표시 방식 ('all': 매일 표시 | 'key': 초하루·보름만 표시 | 'off': 숨김)
  defaultLunarMode: 'all',

  // 7. 기본 등록 기념일 목록 (확정된 기념일만 주석을 해제해 추가하세요)
  // repeat: 'yearly-solar'(양력 매년) | 'yearly-lunar'(음력 매년 자동 환산) | 'none'(단일 날짜)
  defaultAnniversaries: [
    // { id: 'preset-1', title: '선우 생일', startDate: '2026-05-15', endDate: '2026-05-15', repeat: 'yearly-solar', color: '#E53935', note: '행복한 하루 보내기' },
    // { id: 'preset-2', title: '음력 생신 예시', startDate: '2026-03-19', endDate: '2026-03-19', repeat: 'yearly-lunar', lunarMonth: 2, lunarDay: 1, color: '#8B5CF6', note: '' }
  ],

  // 8. 추가 공휴일 / 정부 수시 지정 임시공휴일 테이블
  // 추후 임시공휴일이 발표되면 'YYYY-MM-DD': '공휴일 이름' 형식으로 1줄만 추가하세요.
  extraHolidays: {
    '2026-06-03': '제9회 전국동시지방선거',
    '2028-04-12': '제23대 국회의원선거',
    '2030-06-05': '제10회 전국동시지방선거(예정)'
    // '2027-10-01': '임시공휴일 예시'
  }
};

/* =========================================================================
 * 컬러 프리셋 및 일정 색상 태그 팔레트
 * ========================================================================= */
const THEME_PRESETS = {
  classicRed: { name: '클래식 레드', hex: '#E53935' },
  coralRose: { name: '코랄 로즈', hex: '#F43F5E' },
  peachAmber: { name: '피치 앰버', hex: '#EA580C' },
  forestMint: { name: '포레스트 민트', hex: '#0D9488' },
  royalBlue: { name: '로열 블루', hex: '#2563EB' },
  plumViolet: { name: '플럼 바이올렛', hex: '#7C3AED' }
};

const EVENT_COLORS = [
  '#E53935', // 레드
  '#F97316', // 오렌지
  '#EAB308', // 앰버
  '#10B981', // 민트그린
  '#3B82F6', // 블루
  '#8B5CF6'  // 바이올렛
];

/* =========================================================================
 * 한국천문연구원(KASI) 월력요항 기준 음양력 양방향 변환 엔진
 * - 2021~2031년(양력 2021-02-12 ~ 2032-02-10): KASI 공식 월력요항 초하루·대소·윤달 테이블 100% 일치
 *   (중국 표준시 UTC+8 기반 브라우저 내장 음력과 하루 차이 나는 2028년·2030년 설날 등 완벽 보정)
 * - 범위 외 연도(1900~2099년): 브라우저 Intl 음력 포매터 자동 폴백 지원
 * ========================================================================= */
const KASI_LUNAR_YEARS = [
  // [음력연도, 음력1월1일 양력날짜, 각 음력월 일수 배열(윤달 포함), 윤달이 끼는 기준 월(없으면 0)]
  // 예: leapAfterMonth가 5이면 [1월, 2월, 3월, 4월, 5월, 윤5월, 6월, ..., 12월] 순서
  [2021, '2021-02-12', [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], 0],
  [2022, '2022-02-01', [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], 0],
  [2023, '2023-01-22', [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], 2], // 윤2월
  [2024, '2024-02-10', [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29], 0],
  [2025, '2025-01-29', [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], 6], // 윤6월
  [2026, '2026-02-17', [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], 0],
  [2027, '2027-02-07', [29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30], 0],
  [2028, '2028-01-27', [29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29], 5], // 윤5월
  [2029, '2029-02-13', [30, 30, 29, 30, 30, 29, 29, 30, 29, 29, 30, 30], 0],
  [2030, '2030-02-03', [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], 0],
  [2031, '2031-01-23', [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29], 3]  // 윤3월
];

const KoreanLunarEngine = (() => {
  const MS_PER_DAY = 86400000;
  const solarToLunarCache = new Map();

  function parseYMDToUTC(ymd) {
    const [y, m, d] = ymd.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  }

  function formatUTCDate(utcMs) {
    const dt = new Date(utcMs);
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const parsedYears = KASI_LUNAR_YEARS.map(([lunarYear, startYMD, monthDays, leapAfter]) => {
    const startMs = parseYMDToUTC(startYMD);
    const totalDays = monthDays.reduce((a, b) => a + b, 0);
    return {
      lunarYear,
      startMs,
      endMs: startMs + totalDays * MS_PER_DAY,
      monthDays,
      leapAfter
    };
  });

  let intlChineseFormatter = null;
  try {
    intlChineseFormatter = new Intl.DateTimeFormat('ko-KR-u-ca-chinese', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  } catch (_) {
    intlChineseFormatter = null;
  }

  function solarToLunar(ymd) {
    if (solarToLunarCache.has(ymd)) {
      return solarToLunarCache.get(ymd);
    }

    const targetMs = parseYMDToUTC(ymd);
    for (const row of parsedYears) {
      if (targetMs >= row.startMs && targetMs < row.endMs) {
        let offset = Math.round((targetMs - row.startMs) / MS_PER_DAY);
        for (let i = 0; i < row.monthDays.length; i++) {
          const mLen = row.monthDays[i];
          if (offset < mLen) {
            let lunarMonth = i + 1;
            let isLeap = false;
            if (row.leapAfter > 0) {
              if (i === row.leapAfter) {
                lunarMonth = row.leapAfter;
                isLeap = true;
              } else if (i > row.leapAfter) {
                lunarMonth = i;
              }
            }
            const result = {
              lunarYear: row.lunarYear,
              lunarMonth,
              lunarDay: offset + 1,
              isLeap
            };
            solarToLunarCache.set(ymd, result);
            return result;
          }
          offset -= mLen;
        }
      }
    }

    // 범위 외 연도 Intl 폴백
    if (intlChineseFormatter) {
      try {
        const [y, m, d] = ymd.split('-').map(Number);
        const parts = intlChineseFormatter.formatToParts(new Date(y, m - 1, d, 12, 0, 0));
        let rawMonth = '1';
        let rawDay = '1';
        let rawYear = y;
        for (const p of parts) {
          if (p.type === 'relatedYear') rawYear = Number(p.value);
          if (p.type === 'month') rawMonth = p.value;
          if (p.type === 'day') rawDay = p.value;
        }
        const isLeap = String(rawMonth).includes('윤') || String(rawMonth).includes('bis');
        const lunarMonth = parseInt(String(rawMonth).replace(/[^0-9]/g, ''), 10) || 1;
        const lunarDay = parseInt(String(rawDay).replace(/[^0-9]/g, ''), 10) || 1;
        const fallback = { lunarYear: rawYear, lunarMonth, lunarDay, isLeap };
        solarToLunarCache.set(ymd, fallback);
        return fallback;
      } catch (_) {}
    }

    return null;
  }

  // 음력 연·월·일(평달 우선, 말일 보정 지원) -> 양력 YYYY-MM-DD 변환
  function lunarToSolar(lunarYear, lunarMonth, lunarDay, preferLeap = false) {
    const row = parsedYears.find((r) => r.lunarYear === lunarYear);
    if (row) {
      let dayOffset = 0;
      for (let i = 0; i < row.monthDays.length; i++) {
        let curMonth = i + 1;
        let curLeap = false;
        if (row.leapAfter > 0) {
          if (i === row.leapAfter) {
            curMonth = row.leapAfter;
            curLeap = true;
          } else if (i > row.leapAfter) {
            curMonth = i;
          }
        }
        if (curMonth === lunarMonth && curLeap === preferLeap) {
          const clampedDay = Math.min(lunarDay, row.monthDays[i]);
          return formatUTCDate(row.startMs + (dayOffset + clampedDay - 1) * MS_PER_DAY);
        }
        dayOffset += row.monthDays[i];
      }
      // 윤달 지정이었으나 해당 해에 윤달이 없으면 평달로 환산
      if (preferLeap) {
        return lunarToSolar(lunarYear, lunarMonth, lunarDay, false);
      }
    }

    // 범위 외 연도 탐색 폴백 (양력 연도 부근 일자 스캔)
    const scanStart = Date.UTC(lunarYear, 0, 1);
    const scanEnd = Date.UTC(lunarYear + 1, 2, 1);
    let lastSameMonthMatch = null;
    for (let ms = scanStart; ms < scanEnd; ms += MS_PER_DAY) {
      const ymd = formatUTCDate(ms);
      const info = solarToLunar(ymd);
      if (info && info.lunarYear === lunarYear && info.lunarMonth === lunarMonth && !info.isLeap) {
        lastSameMonthMatch = ymd;
        if (info.lunarDay === lunarDay) return ymd;
      }
    }
    return lastSameMonthMatch;
  }

  function formatLunarLabel(lunar, shortMode = true) {
    if (!lunar) return '';
    const prefix = lunar.isLeap ? '윤' : '';
    if (shortMode) {
      return `${prefix}${lunar.lunarMonth}.${lunar.lunarDay}`;
    }
    return `음력 ${lunar.lunarYear}년 ${prefix}${lunar.lunarMonth}월 ${lunar.lunarDay}일`;
  }

  return {
    solarToLunar,
    lunarToSolar,
    formatLunarLabel,
    parseYMDToUTC,
    formatUTCDate
  };
})();

/* =========================================================================
 * 대한민국 법정공휴일 및 대체공휴일 계산 엔진
 * 근거 법령: 「관공서의 공휴일에 관한 규정」(대통령령 제36290호, 2026. 4. 30. 개정 반영)
 * - 2026년부터 노동절(5.1) 및 제헌절(7.17) 법정공휴일·대체공휴일 적용 반영
 * - 설·추석 연휴: 일요일 또는 타 공휴일과 겹칠 때 대체공휴일 적용 (토요일 겹침 제외)
 * - 3·1절, 노동절, 어린이날, 부처님오신날, 제헌절, 광복절, 개천절, 한글날, 기독탄신일:
 *   토요일·일요일 또는 타 공휴일과 겹칠 때 그다음 첫 번째 비공휴일을 대체공휴일로 지정
 * ========================================================================= */
const KoreanHolidayEngine = (() => {
  const MS_PER_DAY = 86400000;
  const yearHolidayCache = new Map();

  function getDayOfWeekFromYMD(ymd) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0: 일, 6: 토
  }

  function addDaysYMD(ymd, delta) {
    const ms = KoreanLunarEngine.parseYMDToUTC(ymd) + delta * MS_PER_DAY;
    return KoreanLunarEngine.formatUTCDate(ms);
  }

  function getYearHolidays(year) {
    if (yearHolidayCache.has(year)) {
      return yearHolidayCache.get(year);
    }

    // 날짜별 공휴일 배열 (같은 날에 2개 공휴일이 겹치는 경우 추적: 예 2025.5.5 어린이날+부처님오신날, 2028.10.3 추석+개천절)
    const rawMap = new Map();
    const addRaw = (ymd, name, subRule) => {
      if (!ymd || !ymd.startsWith(`${year}-`)) return;
      if (!rawMap.has(ymd)) rawMap.set(ymd, []);
      rawMap.get(ymd).push({ date: ymd, name, subRule, isSubstitute: false });
    };

    // 1. 양력 고정 법정공휴일
    // subRule: 'none'(대체 미적용) | 'sat-sun'(토·일·타공휴일 겹침 시 대체) | 'sun-only'(일·타공휴일 겹침 시 대체)
    addRaw(`${year}-01-01`, '신정', 'none');
    addRaw(`${year}-03-01`, '3·1절', 'sat-sun');
    if (year >= 2026) {
      addRaw(`${year}-05-01`, '노동절', 'sat-sun');
    }
    addRaw(`${year}-05-05`, '어린이날', 'sat-sun');
    addRaw(`${year}-06-06`, '현충일', 'none');
    if (year >= 2026) {
      addRaw(`${year}-07-17`, '제헌절', 'sat-sun');
    }
    addRaw(`${year}-08-15`, '광복절', 'sat-sun');
    addRaw(`${year}-10-03`, '개천절', 'sat-sun');
    addRaw(`${year}-10-09`, '한글날', 'sat-sun');
    addRaw(`${year}-12-25`, '성탄절', 'sat-sun');

    // 2. 음력 기반 법정공휴일 (설날 연휴, 부처님오신날, 추석 연휴)
    const seollalDay = KoreanLunarEngine.lunarToSolar(year, 1, 1, false);
    if (seollalDay) {
      addRaw(addDaysYMD(seollalDay, -1), '설날 연휴', 'sun-only');
      addRaw(seollalDay, '설날', 'sun-only');
      addRaw(addDaysYMD(seollalDay, 1), '설날 연휴', 'sun-only');
    }
    // 다음 해 설날 전날(음력 12월 말일)이 양력 12월 말에 걸치는 예외 케이스 방어
    const nextSeollal = KoreanLunarEngine.lunarToSolar(year + 1, 1, 1, false);
    if (nextSeollal) {
      const nextSeollalEve = addDaysYMD(nextSeollal, -1);
      if (nextSeollalEve.startsWith(`${year}-`)) {
        addRaw(nextSeollalEve, '설날 연휴', 'sun-only');
      }
    }

    const buddhaDay = KoreanLunarEngine.lunarToSolar(year, 4, 8, false);
    if (buddhaDay) {
      addRaw(buddhaDay, '부처님오신날', 'sat-sun');
    }

    const chuseokDay = KoreanLunarEngine.lunarToSolar(year, 8, 15, false);
    if (chuseokDay) {
      addRaw(addDaysYMD(chuseokDay, -1), '추석 연휴', 'sun-only');
      addRaw(chuseokDay, '추석', 'sun-only');
      addRaw(addDaysYMD(chuseokDay, 1), '추석 연휴', 'sun-only');
    }

    // 3. 선거일 및 임시공휴일 (APP_CONFIG.extraHolidays)
    Object.entries(APP_CONFIG.extraHolidays || {}).forEach(([ymd, title]) => {
      if (ymd.startsWith(`${year}-`)) {
        addRaw(ymd, title, 'none');
      }
    });

    // 날짜 오름차순 정렬 후 대체공휴일 산정
    const sortedDates = Array.from(rawMap.keys()).sort();
    const occupiedDates = new Set(sortedDates);

    // 설날·추석 연휴 블록의 마지막 날 찾기 보조
    const getHolidayClusterEnd = (baseDate, baseName) => {
      if (baseName.includes('설날') && seollalDay) {
        return addDaysYMD(seollalDay, 1);
      }
      if (baseName.includes('추석') && chuseokDay) {
        return addDaysYMD(chuseokDay, 1);
      }
      return baseDate;
    };

    const substitutes = [];

    for (const ymd of sortedDates) {
      const items = rawMap.get(ymd);
      const dow = getDayOfWeekFromYMD(ymd);

      items.forEach((item, idx) => {
        if (item.subRule === 'none') return;

        const overlappedWithSunday = dow === 0;
        const overlappedWithSaturday = dow === 6 && item.subRule === 'sat-sun';
        // 같은 날짜에 앞서 등록된 다른 공휴일과 겹친 경우 (idx > 0)
        const overlappedWithOtherHoliday = idx > 0;

        if (overlappedWithSunday || overlappedWithSaturday || overlappedWithOtherHoliday) {
          let candidate = addDaysYMD(getHolidayClusterEnd(ymd, item.name), 1);
          while (true) {
            const cDow = getDayOfWeekFromYMD(candidate);
            const isWeekend = cDow === 0 || cDow === 6;
            if (!isWeekend && !occupiedDates.has(candidate)) {
              occupiedDates.add(candidate);
              const cleanBase = item.name.replace(' 연휴', '');
              substitutes.push({
                date: candidate,
                name: `대체공휴일(${cleanBase})`,
                subRule: 'none',
                isSubstitute: true
              });
              break;
            }
            candidate = addDaysYMD(candidate, 1);
          }
        }
      });
    }

    // 최종 날짜별 공휴일 맵 병합
    const finalMap = new Map();
    for (const [ymd, items] of rawMap.entries()) {
      finalMap.set(ymd, {
        date: ymd,
        names: items.map((x) => x.name),
        label: items.map((x) => x.name).join(' · '),
        isSubstitute: false
      });
    }
    for (const sub of substitutes) {
      if (sub.date.startsWith(`${year}-`)) {
        finalMap.set(sub.date, {
          date: sub.date,
          names: [sub.name],
          label: sub.name,
          isSubstitute: true
        });
      }
    }

    const sortedFinal = new Map([...finalMap.entries()].sort((a, b) => a[0].localeCompare(b[0])));
    yearHolidayCache.set(year, sortedFinal);
    return sortedFinal;
  }

  function getHolidayForDate(ymd) {
    const year = Number(ymd.slice(0, 4));
    const map = getYearHolidays(year);
    return map.get(ymd) || null;
  }

  // 특정 공휴일이 포함된 주말 결합 총 연휴 길이 계산 (연간 모아보기용)
  function getContinuousOffDaysCount(ymd) {
    const isOff = (dStr) => {
      const dow = getDayOfWeekFromYMD(dStr);
      return dow === 0 || dow === 6 || Boolean(getHolidayForDate(dStr));
    };
    let start = ymd;
    while (isOff(addDaysYMD(start, -1))) {
      start = addDaysYMD(start, -1);
    }
    let end = ymd;
    while (isOff(addDaysYMD(end, 1))) {
      end = addDaysYMD(end, 1);
    }
    const diff = Math.round(
      (KoreanLunarEngine.parseYMDToUTC(end) - KoreanLunarEngine.parseYMDToUTC(start)) / MS_PER_DAY
    ) + 1;
    return diff;
  }

  return {
    getYearHolidays,
    getHolidayForDate,
    getContinuousOffDaysCount,
    addDaysYMD,
    getDayOfWeekFromYMD
  };
})();

/* =========================================================================
 * 로컬 데이터 영속화 스토리지 매니저 (localStorage + IndexedDB 이중 안전 보관)
 * ========================================================================= */
const StorageManager = (() => {
  const LS_DATA_KEY = 'seonwoo_red_calendar_data_v1';
  const LS_PREF_KEY = 'seonwoo_red_calendar_prefs_v1';
  const DB_NAME = 'SeonwooRedCalendarDB';
  const STORE_NAME = 'kv';

  function openIDB() {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  async function idbGet(key) {
    const db = await openIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  async function idbSet(key, value) {
    const db = await openIDB();
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
    } catch (_) {}
  }

  function safeLSGet(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function safeLSSet(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  async function loadAll() {
    if (navigator.storage && navigator.storage.persist) {
      try {
        navigator.storage.persist();
      } catch (_) {}
    }

    let eventsData = safeLSGet(LS_DATA_KEY);
    if (!eventsData) {
      eventsData = await idbGet(LS_DATA_KEY);
      if (eventsData) safeLSSet(LS_DATA_KEY, eventsData);
    }

    let prefs = safeLSGet(LS_PREF_KEY);
    if (!prefs) {
      prefs = await idbGet(LS_PREF_KEY);
      if (prefs) safeLSSet(LS_PREF_KEY, prefs);
    }

    // 최초 실행 시 APP_CONFIG.defaultAnniversaries 병합
    let items = Array.isArray(eventsData?.items) ? eventsData.items : [];
    if (Array.isArray(APP_CONFIG.defaultAnniversaries) && APP_CONFIG.defaultAnniversaries.length > 0) {
      const existingIds = new Set(items.map((x) => x.id));
      for (const preset of APP_CONFIG.defaultAnniversaries) {
        if (preset.id && !existingIds.has(preset.id)) {
          items.push({
            id: preset.id,
            title: preset.title,
            startDate: preset.startDate,
            endDate: preset.endDate || preset.startDate,
            repeat: preset.repeat || 'yearly-solar',
            lunarMonth: preset.lunarMonth || null,
            lunarDay: preset.lunarDay || null,
            color: preset.color || EVENT_COLORS[0],
            note: preset.note || '',
            completedDates: [],
            createdAt: Date.now()
          });
        }
      }
    }

    return {
      items,
      prefs: {
        theme: prefs?.theme || APP_CONFIG.defaultTheme || 'classicRed',
        lunarMode: prefs?.lunarMode || APP_CONFIG.defaultLunarMode || 'all',
        appearance: prefs?.appearance || 'system',
        giftSeen: Boolean(prefs?.giftSeen)
      }
    };
  }

  async function saveItems(items) {
    const payload = { version: 1, updatedAt: new Date().toISOString(), items };
    safeLSSet(LS_DATA_KEY, payload);
    await idbSet(LS_DATA_KEY, payload);
  }

  async function savePrefs(prefs) {
    safeLSSet(LS_PREF_KEY, prefs);
    await idbSet(LS_PREF_KEY, prefs);
  }

  return { loadAll, saveItems, savePrefs };
})();

/* =========================================================================
 * 메인 애플리케이션 상태 및 UI 컨트롤러
 * ========================================================================= */
(() => {
  const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

  function getTodayYMD() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const todayYMD = getTodayYMD();
  const state = {
    viewYear: Number(todayYMD.slice(0, 4)),
    viewMonth: Number(todayYMD.slice(5, 7)), // 1~12
    selectedDate: todayYMD,
    pickerYear: Number(todayYMD.slice(0, 4)),
    holidayModalYear: Number(todayYMD.slice(0, 4)),
    activeColor: EVENT_COLORS[0],
    editingId: '',
    items: [],
    prefs: {
      theme: APP_CONFIG.defaultTheme || 'classicRed',
      lunarMode: APP_CONFIG.defaultLunarMode || 'all',
      appearance: 'system',
      giftSeen: false
    }
  };

  // DOM 참조
  const el = {
    currentMonthLabel: document.getElementById('currentMonthLabel'),
    appBrandBadge: document.getElementById('appBrandBadge'),
    monthSummaryText: document.getElementById('monthSummaryText'),
    calendarViewport: document.getElementById('calendarViewport'),
    calendarWeeks: document.getElementById('calendarWeeks'),
    selectedDayPreview: document.getElementById('selectedDayPreview'),
    quickOpenSheetBtn: document.getElementById('quickOpenSheetBtn'),
    goTodayBtn: document.getElementById('goTodayBtn'),
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),
    monthPickerBtn: document.getElementById('monthPickerBtn'),
    openGiftBtn: document.getElementById('openGiftBtn'),
    openHolidaysBtn: document.getElementById('openHolidaysBtn'),
    openSearchBtn: document.getElementById('openSearchBtn'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    sheetBackdrop: document.getElementById('sheetBackdrop'),

    dayBottomSheet: document.getElementById('dayBottomSheet'),
    sheetDateTitle: document.getElementById('sheetDateTitle'),
    sheetDdayChip: document.getElementById('sheetDdayChip'),
    sheetSubMeta: document.getElementById('sheetSubMeta'),
    quickMemoForm: document.getElementById('quickMemoForm'),
    quickMemoInput: document.getElementById('quickMemoInput'),
    quickSaveBtn: document.getElementById('quickSaveBtn'),
    activeColorDotBtn: document.getElementById('activeColorDotBtn'),
    colorPaletteInline: document.getElementById('colorPaletteInline'),
    toggleDetailOptionsBtn: document.getElementById('toggleDetailOptionsBtn'),
    detailOptionsPanel: document.getElementById('detailOptionsPanel'),
    eventStartDateInput: document.getElementById('eventStartDateInput'),
    eventEndDateInput: document.getElementById('eventEndDateInput'),
    eventRepeatSelect: document.getElementById('eventRepeatSelect'),
    eventNoteInput: document.getElementById('eventNoteInput'),
    editCancelRow: document.getElementById('editCancelRow'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    dayEventsContainer: document.getElementById('dayEventsContainer'),

    monthPickerSheet: document.getElementById('monthPickerSheet'),
    pickerPrevYearBtn: document.getElementById('pickerPrevYearBtn'),
    pickerNextYearBtn: document.getElementById('pickerNextYearBtn'),
    pickerYearLabel: document.getElementById('pickerYearLabel'),
    pickerMonthGrid: document.getElementById('pickerMonthGrid'),

    holidaysSheet: document.getElementById('holidaysSheet'),
    holidaysCountSummary: document.getElementById('holidaysCountSummary'),
    holidayPrevYearBtn: document.getElementById('holidayPrevYearBtn'),
    holidayNextYearBtn: document.getElementById('holidayNextYearBtn'),
    holidayYearLabel: document.getElementById('holidayYearLabel'),
    yearlyHolidaysList: document.getElementById('yearlyHolidaysList'),

    searchSheet: document.getElementById('searchSheet'),
    searchKeywordInput: document.getElementById('searchKeywordInput'),
    searchResultsList: document.getElementById('searchResultsList'),

    settingsSheet: document.getElementById('settingsSheet'),
    themePresetGrid: document.getElementById('themePresetGrid'),
    lunarDisplayModeSelect: document.getElementById('lunarDisplayModeSelect'),
    appearanceModeSelect: document.getElementById('appearanceModeSelect'),
    backupStatsBox: document.getElementById('backupStatsBox'),
    downloadBackupBtn: document.getElementById('downloadBackupBtn'),
    copyBackupClipboardBtn: document.getElementById('copyBackupClipboardBtn'),
    restoreModeSelect: document.getElementById('restoreModeSelect'),
    uploadBackupInput: document.getElementById('uploadBackupInput'),
    togglePasteRestoreBtn: document.getElementById('togglePasteRestoreBtn'),
    pasteRestoreArea: document.getElementById('pasteRestoreArea'),
    pasteRestoreTextarea: document.getElementById('pasteRestoreTextarea'),
    applyPasteRestoreBtn: document.getElementById('applyPasteRestoreBtn'),

    giftModalWrap: document.getElementById('giftModalWrap'),
    giftModalTitle: document.getElementById('giftModalTitle'),
    giftModalMessage: document.getElementById('giftModalMessage'),
    giftModalSender: document.getElementById('giftModalSender'),
    closeGiftModalBtn: document.getElementById('closeGiftModalBtn'),

    toastBanner: document.getElementById('toastBanner')
  };

  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    el.toastBanner.textContent = msg;
    el.toastBanner.hidden = false;
    toastTimer = setTimeout(() => {
      el.toastBanner.hidden = true;
    }, 2300);
  }

  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) || 229;
    const g = parseInt(clean.substring(2, 4), 16) || 57;
    const b = parseInt(clean.substring(4, 6), 16) || 53;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // iOS Safari 홈 화면 추가 시 별도 PNG 파일 없이도 선명한 180x180 아이콘을 생성
  function syncAppleTouchIcon(accentHex) {
    const iconLink = document.getElementById('appleTouchIcon');
    if (!iconLink) return;
    if (APP_CONFIG.customIconPath && APP_CONFIG.customIconPath.trim() !== '') {
      iconLink.href = APP_CONFIG.customIconPath.trim();
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 180;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 배경
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 180, 180);

      // 상단 컬러 헤더
      ctx.fillStyle = accentHex;
      ctx.fillRect(0, 0, 180, 54);

      // 상단 요일 포인트
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '700 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(APP_CONFIG.appTitle.slice(0, 6), 90, 28);

      // 중앙 숫자(오늘 일자)
      const dayNum = String(Number(todayYMD.slice(8, 10)));
      ctx.fillStyle = accentHex;
      ctx.font = '800 76px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(dayNum, 90, 120);

      iconLink.href = canvas.toDataURL('image/png');
    } catch (_) {}
  }

  function applyPreferences() {
    const preset = THEME_PRESETS[state.prefs.theme] || THEME_PRESETS.classicRed;
    const root = document.documentElement;
    root.style.setProperty('--accent', preset.hex);
    root.style.setProperty('--accent-soft', hexToRgba(preset.hex, 0.11));
    root.style.setProperty('--accent-border', hexToRgba(preset.hex, 0.28));

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark =
      state.prefs.appearance === 'dark' ||
      (state.prefs.appearance === 'system' && prefersDark);

    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      document.getElementById('metaThemeColor')?.setAttribute('content', '#121417');
    } else {
      root.removeAttribute('data-theme');
      document.getElementById('metaThemeColor')?.setAttribute('content', '#FFFFFF');
    }

    document.title = APP_CONFIG.appTitle || '빨간달력';
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute(
      'content',
      APP_CONFIG.appTitle || '빨간달력'
    );
    el.appBrandBadge.textContent = APP_CONFIG.appTitle || '빨간달력';

    syncAppleTouchIcon(preset.hex);
  }

  /* =======================================================================
   * 특정 날짜(ymd)에 해당하는 모든 일정 인스턴스 판별 (단일·연속·반복 포함)
   * ======================================================================= */
  function getEventsOnDate(ymd) {
    const targetYear = Number(ymd.slice(0, 4));
    const targetMonth = Number(ymd.slice(5, 7));
    const targetDay = Number(ymd.slice(8, 10));
    const targetDow = KoreanHolidayEngine.getDayOfWeekFromYMD(ymd);

    const matched = [];

    for (const item of state.items) {
      const start = item.startDate;
      const end = item.endDate && item.endDate >= start ? item.endDate : start;
      const repeat = item.repeat || 'none';
      let isHit = false;
      let instanceStart = start;
      let instanceEnd = end;

      if (repeat === 'none') {
        if (ymd >= start && ymd <= end) {
          isHit = true;
        }
      } else if (repeat === 'yearly-solar') {
        const sMonthDay = start.slice(5);
        // 윤년 2월 29일 보정
        let candidateYMD = `${targetYear}-${sMonthDay}`;
        if (sMonthDay === '02-29') {
          const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
          if (!isLeapYear) candidateYMD = `${targetYear}-02-28`;
        }
        if (ymd === candidateYMD) {
          isHit = true;
          instanceStart = ymd;
          instanceEnd = ymd;
        }
      } else if (repeat === 'yearly-lunar') {
        let lMonth = item.lunarMonth;
        let lDay = item.lunarDay;
        if (!lMonth || !lDay) {
          const baseLunar = KoreanLunarEngine.solarToLunar(start);
          lMonth = baseLunar ? baseLunar.lunarMonth : 1;
          lDay = baseLunar ? baseLunar.lunarDay : 1;
        }
        // 음력 11~12월은 양력 해 넘김이 있으므로 targetYear 및 targetYear-1 모두 확인
        const candA = KoreanLunarEngine.lunarToSolar(targetYear, lMonth, lDay, false);
        const candB = KoreanLunarEngine.lunarToSolar(targetYear - 1, lMonth, lDay, false);
        if (ymd === candA || ymd === candB) {
          isHit = true;
          instanceStart = ymd;
          instanceEnd = ymd;
        }
      } else if (repeat === 'monthly') {
        if (ymd >= start) {
          const baseDay = Number(start.slice(8, 10));
          const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
          const effectiveDay = Math.min(baseDay, lastDayOfTargetMonth);
          if (targetDay === effectiveDay) {
            isHit = true;
            instanceStart = ymd;
            instanceEnd = ymd;
          }
        }
      } else if (repeat === 'weekly') {
        if (ymd >= start) {
          const startDow = KoreanHolidayEngine.getDayOfWeekFromYMD(start);
          if (targetDow === startDow) {
            isHit = true;
            instanceStart = ymd;
            instanceEnd = ymd;
          }
        }
      }

      if (isHit) {
        const isDone = Array.isArray(item.completedDates) && item.completedDates.includes(ymd);
        const isMultiDay = repeat === 'none' && instanceEnd > instanceStart;
        matched.push({
          raw: item,
          id: item.id,
          title: item.title,
          color: item.color || EVENT_COLORS[0],
          note: item.note || '',
          repeat,
          isDone,
          isMultiDay,
          instanceStart,
          instanceEnd
        });
      }
    }

    // 연속 일정을 상단에 배치해 주간 연결 바가 가지런히 이어지도록 정렬
    matched.sort((a, b) => {
      if (a.isMultiDay !== b.isMultiDay) return a.isMultiDay ? -1 : 1;
      if (a.instanceStart !== b.instanceStart) return a.instanceStart.localeCompare(b.instanceStart);
      return (a.raw.createdAt || 0) - (b.raw.createdAt || 0);
    });

    return matched;
  }

  /* =======================================================================
   * 월간 달력 렌더링
   * ======================================================================= */
  function buildMonthMatrix(year, month) {
    const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const totalCells = firstDow + daysInMonth > 35 ? 42 : 35;
    const firstCellUTC = Date.UTC(year, month - 1, 1 - firstDow);

    const weeks = [];
    for (let w = 0; w < totalCells / 7; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d;
        const cellMs = firstCellUTC + idx * 86400000;
        const ymd = KoreanLunarEngine.formatUTCDate(cellMs);
        const cellMonth = Number(ymd.slice(5, 7));
        week.push({
          ymd,
          dayNum: Number(ymd.slice(8, 10)),
          dow: d,
          isOutside: cellMonth !== month
        });
      }
      weeks.push(week);
    }
    return weeks;
  }

  function shouldShowLunarOnCell(lunar, dayNum) {
    if (!lunar || state.prefs.lunarMode === 'off') return false;
    if (state.prefs.lunarMode === 'all') return true;
    return lunar.lunarDay === 1 || lunar.lunarDay === 15 || dayNum === 1;
  }

  function renderCalendar() {
    const { viewYear, viewMonth } = state;
    el.currentMonthLabel.textContent = `${viewYear}년 ${viewMonth}월`;

    // 이달의 공휴일 요약 계산
    const yearMap = KoreanHolidayEngine.getYearHolidays(viewYear);
    const monthPrefix = `${viewYear}-${String(viewMonth).padStart(2, '0')}-`;
    const monthHolidays = [];
    for (const [dStr, hObj] of yearMap.entries()) {
      if (dStr.startsWith(monthPrefix)) monthHolidays.push(hObj);
    }

    if (monthHolidays.length > 0) {
      const namesPreview = [...new Set(monthHolidays.map((h) => h.label.replace(/대체공휴일\((.+)\)/, '$1 대체')))];
      el.monthSummaryText.textContent = `이달의 빨간 날 ${monthHolidays.length}일 · ${namesPreview.slice(0, 3).join(', ')}`;
    } else {
      el.monthSummaryText.textContent = `${viewMonth}월에는 법정 공휴일이 없습니다`;
    }

    const weeks = buildMonthMatrix(viewYear, viewMonth);
    const maxVisibleSlots = weeks.length === 6 ? 2 : 3;
    const fragment = document.createDocumentFragment();

    for (const week of weeks) {
      const weekRow = document.createElement('div');
      weekRow.className = 'week-row';
      weekRow.setAttribute('role', 'row');

      for (let col = 0; col < 7; col++) {
        const cellInfo = week[col];
        const holiday = KoreanHolidayEngine.getHolidayForDate(cellInfo.ymd);
        const lunar = KoreanLunarEngine.solarToLunar(cellInfo.ymd);
        const dayEvents = getEventsOnDate(cellInfo.ymd);

        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.dataset.ymd = cellInfo.ymd;
        cell.setAttribute('role', 'gridcell');

        if (cellInfo.dow === 0) cell.classList.add('is-sun');
        if (cellInfo.dow === 6) cell.classList.add('is-sat');
        if (holiday) cell.classList.add('is-holiday');
        if (cellInfo.isOutside) cell.classList.add('is-outside');
        if (cellInfo.ymd === todayYMD) cell.classList.add('is-today');
        if (cellInfo.ymd === state.selectedDate) cell.classList.add('is-selected');

        // 상단 숫자 + 음력
        const topLine = document.createElement('div');
        topLine.className = 'day-top-line';

        const numSpan = document.createElement('span');
        numSpan.className = 'day-number';
        numSpan.textContent = String(cellInfo.dayNum);
        topLine.appendChild(numSpan);

        if (shouldShowLunarOnCell(lunar, cellInfo.dayNum)) {
          const lunarSpan = document.createElement('span');
          lunarSpan.className = 'lunar-tiny';
          lunarSpan.textContent = KoreanLunarEngine.formatLunarLabel(lunar, true);
          topLine.appendChild(lunarSpan);
        }
        cell.appendChild(topLine);

        // 공휴일 라벨 (좁은 모바일 셀에서는 말줄임 없이 핵심 명칭 표시, 상세 시트에서는 전체 명칭 표시)
        const holidayDiv = document.createElement('div');
        holidayDiv.className = 'holiday-caption';
        if (holiday) {
          holidayDiv.textContent = holiday.isSubstitute
            ? '대체공휴일'
            : holiday.label
                .replace('제9회 전국동시지방선거', '지방선거')
                .replace('제10회 전국동시지방선거(예정)', '지방선거')
                .replace('제23대 국회의원선거', '국회의원선거');
        }
        cell.appendChild(holidayDiv);

        // 일정 및 연속 일정 바
        const stack = document.createElement('div');
        stack.className = 'cell-events-stack';

        const visibleEvents = dayEvents.slice(0, maxVisibleSlots);
        for (const ev of visibleEvents) {
          const pill = document.createElement('div');
          pill.className = 'cell-event-pill';
          pill.style.backgroundColor = ev.color;
          if (ev.isDone) pill.classList.add('is-done');

          if (ev.isMultiDay) {
            const continuesLeft = ev.instanceStart < cellInfo.ymd && col > 0;
            const continuesRight = ev.instanceEnd > cellInfo.ymd && col < 6;
            if (continuesLeft && continuesRight) {
              pill.classList.add('span-mid');
              pill.textContent = '\u00A0';
            } else if (!continuesLeft && continuesRight) {
              pill.classList.add('span-start');
              pill.textContent = ev.title;
            } else if (continuesLeft && !continuesRight) {
              pill.classList.add('span-end');
              pill.textContent = cellInfo.ymd === ev.instanceEnd ? '' : ev.title;
              if (!pill.textContent) pill.textContent = '\u00A0';
            } else {
              pill.textContent = ev.title;
            }
          } else {
            pill.textContent = ev.title;
          }

          stack.appendChild(pill);
        }

        if (dayEvents.length > maxVisibleSlots) {
          const more = document.createElement('div');
          more.className = 'cell-more-count';
          more.textContent = `+${dayEvents.length - maxVisibleSlots}개 더보기`;
          stack.appendChild(more);
        }

        cell.appendChild(stack);
        weekRow.appendChild(cell);
      }

      fragment.appendChild(weekRow);
    }

    el.calendarWeeks.innerHTML = '';
    el.calendarWeeks.appendChild(fragment);
    updateBottomQuickBar();
  }

  function updateBottomQuickBar() {
    const ymd = state.selectedDate;
    const [, m, d] = ymd.split('-').map(Number);
    const dow = WEEKDAY_KO[KoreanHolidayEngine.getDayOfWeekFromYMD(ymd)];
    const holiday = KoreanHolidayEngine.getHolidayForDate(ymd);
    const events = getEventsOnDate(ymd);

    const parts = [`${m}월 ${d}일(${dow})`];
    if (holiday) parts.push(holiday.label);
    if (events.length > 0) {
      parts.push(`일정 ${events.length}개`);
    } else {
      parts.push('등록된 메모 없음');
    }
    el.selectedDayPreview.textContent = parts.join(' · ');
  }

  /* =======================================================================
   * 바텀시트 열기 / 닫기 관리
   * ======================================================================= */
  const allSheets = [
    el.dayBottomSheet,
    el.monthPickerSheet,
    el.holidaysSheet,
    el.searchSheet,
    el.settingsSheet
  ];

  function closeAllSheets() {
    allSheets.forEach((sheet) => {
      sheet.classList.remove('is-open');
      sheet.setAttribute('aria-hidden', 'true');
    });
    el.sheetBackdrop.classList.remove('is-open');
    setTimeout(() => {
      const anyOpen = allSheets.some((s) => s.classList.contains('is-open'));
      if (!anyOpen) el.sheetBackdrop.hidden = true;
    }, 220);
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  function openSheet(targetSheet) {
    allSheets.forEach((sheet) => {
      if (sheet !== targetSheet) {
        sheet.classList.remove('is-open');
        sheet.setAttribute('aria-hidden', 'true');
      }
    });
    el.sheetBackdrop.hidden = false;
    requestAnimationFrame(() => {
      el.sheetBackdrop.classList.add('is-open');
      targetSheet.classList.add('is-open');
      targetSheet.setAttribute('aria-hidden', 'false');
    });
  }

  /* =======================================================================
   * 날짜 상세 및 초간편 입력 시트 렌더링
   * ======================================================================= */
  function formatDdayText(ymd) {
    const diff = Math.round(
      (KoreanLunarEngine.parseYMDToUTC(ymd) - KoreanLunarEngine.parseYMDToUTC(todayYMD)) / 86400000
    );
    if (diff === 0) return '오늘';
    if (diff === 1) return '내일';
    if (diff === -1) return '어제';
    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  }

  function resetQuickMemoForm(defaultYMD) {
    state.editingId = '';
    el.quickMemoInput.value = '';
    el.eventStartDateInput.value = defaultYMD;
    el.eventEndDateInput.value = defaultYMD;
    el.eventRepeatSelect.value = 'none';
    el.eventNoteInput.value = '';
    el.quickSaveBtn.textContent = '저장';
    el.editCancelRow.hidden = true;
    el.detailOptionsPanel.hidden = true;
    el.toggleDetailOptionsBtn.setAttribute('aria-expanded', 'false');
    el.toggleDetailOptionsBtn.textContent = '기간·반복·메모 설정 ▾';
  }

  function renderColorSwatches() {
    el.activeColorDotBtn.style.backgroundColor = state.activeColor;
    el.colorPaletteInline.innerHTML = '';
    EVENT_COLORS.forEach((hex) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-swatch' + (hex === state.activeColor ? ' is-active' : '');
      btn.style.backgroundColor = hex;
      btn.setAttribute('aria-label', `색상 ${hex}`);
      btn.addEventListener('click', () => {
        state.activeColor = hex;
        renderColorSwatches();
      });
      el.colorPaletteInline.appendChild(btn);
    });
  }

  function getRepeatBadgeLabel(item) {
    switch (item.repeat) {
      case 'yearly-solar':
        return '매년 반복(양력)';
      case 'yearly-lunar':
        return `매년 음력 ${item.lunarMonth || ''}월 ${item.lunarDay || ''}일`;
      case 'monthly':
        return '매월 반복';
      case 'weekly':
        return '매주 반복';
      default:
        return '';
    }
  }

  function renderDaySheetContent(ymd) {
    const [y, m, d] = ymd.split('-').map(Number);
    const dow = WEEKDAY_KO[KoreanHolidayEngine.getDayOfWeekFromYMD(ymd)];
    const lunar = KoreanLunarEngine.solarToLunar(ymd);
    const holiday = KoreanHolidayEngine.getHolidayForDate(ymd);

    el.sheetDateTitle.textContent = `${y}년 ${m}월 ${d}일 (${dow})`;
    el.sheetDdayChip.textContent = formatDdayText(ymd);
    el.sheetSubMeta.textContent = lunar ? KoreanLunarEngine.formatLunarLabel(lunar, false) : '';

    const container = el.dayEventsContainer;
    container.innerHTML = '';

    if (holiday) {
      const hBanner = document.createElement('div');
      hBanner.className = 'holiday-banner-item';
      const streak = KoreanHolidayEngine.getContinuousOffDaysCount(ymd);
      hBanner.innerHTML = `<span>🔴 ${holiday.label}</span><span>${streak >= 3 ? `${streak}일 연휴` : '공휴일'}</span>`;
      container.appendChild(hBanner);
    }

    const events = getEventsOnDate(ymd);
    if (events.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-day-state';
      empty.textContent = '위 입력창에 할 일이나 메모를 적고 바로 저장해보세요.';
      container.appendChild(empty);
      return;
    }

    for (const ev of events) {
      const card = document.createElement('div');
      card.className = 'event-card-item';
      card.style.borderLeftColor = ev.color;

      const checkBtn = document.createElement('button');
      checkBtn.type = 'button';
      checkBtn.className = 'event-check-btn' + (ev.isDone ? ' is-checked' : '');
      checkBtn.setAttribute('aria-label', ev.isDone ? '완료 해제' : '완료 체크');
      checkBtn.textContent = ev.isDone ? '✓' : '';
      checkBtn.addEventListener('click', () => toggleCompleteEvent(ev.id, ymd));

      const body = document.createElement('div');
      body.className = 'event-card-content';

      const titleDiv = document.createElement('div');
      titleDiv.className = 'event-card-title' + (ev.isDone ? ' is-done' : '');
      titleDiv.textContent = ev.title;
      body.appendChild(titleDiv);

      const badges = document.createElement('div');
      badges.className = 'event-card-badges';
      if (ev.isMultiDay) {
        const rangeTag = document.createElement('span');
        rangeTag.className = 'meta-tag';
        rangeTag.textContent = `${ev.instanceStart.slice(5).replace('-', '.')} ~ ${ev.instanceEnd.slice(5).replace('-', '.')}`;
        badges.appendChild(rangeTag);
      }
      const repText = getRepeatBadgeLabel(ev.raw);
      if (repText) {
        const repTag = document.createElement('span');
        repTag.className = 'meta-tag';
        repTag.textContent = repText;
        badges.appendChild(repTag);
      }
      if (badges.childNodes.length > 0) body.appendChild(badges);

      if (ev.note) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'event-card-note';
        noteDiv.textContent = ev.note;
        body.appendChild(noteDiv);
      }

      const actions = document.createElement('div');
      actions.className = 'event-card-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'mini-action-btn';
      editBtn.textContent = '수정';
      editBtn.addEventListener('click', () => startEditEvent(ev.raw));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'mini-action-btn danger';
      delBtn.textContent = '삭제';
      delBtn.addEventListener('click', () => deleteEventItem(ev.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      card.appendChild(checkBtn);
      card.appendChild(body);
      card.appendChild(actions);
      container.appendChild(card);
    }
  }

  function openDaySheet(ymd, focusInput = false) {
    state.selectedDate = ymd;
    const y = Number(ymd.slice(0, 4));
    const m = Number(ymd.slice(5, 7));
    if (y !== state.viewYear || m !== state.viewMonth) {
      state.viewYear = y;
      state.viewMonth = m;
    }
    renderCalendar();
    resetQuickMemoForm(ymd);
    renderColorSwatches();
    renderDaySheetContent(ymd);
    openSheet(el.dayBottomSheet);

    if (focusInput) {
      setTimeout(() => el.quickMemoInput.focus(), 260);
    }
  }

  /* =======================================================================
   * 일정 추가 · 수정 · 완료 체크 · 삭제
   * ======================================================================= */
  async function handleSaveMemo(e) {
    e.preventDefault();
    const title = el.quickMemoInput.value.trim();
    if (!title) {
      showToast('내용을 입력해 주세요');
      el.quickMemoInput.focus();
      return;
    }

    let startDate = el.eventStartDateInput.value || state.selectedDate;
    let endDate = el.eventEndDateInput.value || startDate;
    if (endDate < startDate) {
      const tmp = startDate;
      startDate = endDate;
      endDate = tmp;
    }

    const repeat = el.eventRepeatSelect.value || 'none';
    const note = el.eventNoteInput.value.trim();

    let lunarMonth = null;
    let lunarDay = null;
    if (repeat === 'yearly-lunar') {
      const lunarInfo = KoreanLunarEngine.solarToLunar(startDate);
      if (lunarInfo) {
        lunarMonth = lunarInfo.lunarMonth;
        lunarDay = lunarInfo.lunarDay;
      }
    }

    if (state.editingId) {
      const idx = state.items.findIndex((x) => x.id === state.editingId);
      if (idx !== -1) {
        state.items[idx] = {
          ...state.items[idx],
          title,
          startDate,
          endDate: repeat === 'none' ? endDate : startDate,
          repeat,
          lunarMonth,
          lunarDay,
          color: state.activeColor,
          note
        };
      }
      showToast('일정이 수정되었습니다');
    } else {
      const newItem = {
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        startDate,
        endDate: repeat === 'none' ? endDate : startDate,
        repeat,
        lunarMonth,
        lunarDay,
        color: state.activeColor,
        note,
        completedDates: [],
        createdAt: Date.now()
      };
      state.items.push(newItem);
      showToast('간편 기록이 저장되었습니다');
    }

    await StorageManager.saveItems(state.items);
    resetQuickMemoForm(state.selectedDate);
    renderCalendar();
    renderDaySheetContent(state.selectedDate);
  }

  function startEditEvent(rawItem) {
    state.editingId = rawItem.id;
    state.activeColor = rawItem.color || EVENT_COLORS[0];
    el.quickMemoInput.value = rawItem.title;
    el.eventStartDateInput.value = rawItem.startDate;
    el.eventEndDateInput.value = rawItem.endDate || rawItem.startDate;
    el.eventRepeatSelect.value = rawItem.repeat || 'none';
    el.eventNoteInput.value = rawItem.note || '';
    el.quickSaveBtn.textContent = '수정 완료';
    el.editCancelRow.hidden = false;
    el.detailOptionsPanel.hidden = false;
    el.toggleDetailOptionsBtn.setAttribute('aria-expanded', 'true');
    el.toggleDetailOptionsBtn.textContent = '기간·반복·메모 접기 ▴';
    renderColorSwatches();
    el.quickMemoInput.focus();
  }

  async function toggleCompleteEvent(itemId, ymd) {
    const target = state.items.find((x) => x.id === itemId);
    if (!target) return;
    if (!Array.isArray(target.completedDates)) target.completedDates = [];
    const pos = target.completedDates.indexOf(ymd);
    if (pos === -1) {
      target.completedDates.push(ymd);
    } else {
      target.completedDates.splice(pos, 1);
    }
    await StorageManager.saveItems(state.items);
    renderCalendar();
    renderDaySheetContent(state.selectedDate);
  }

  async function deleteEventItem(itemId) {
    state.items = state.items.filter((x) => x.id !== itemId);
    if (state.editingId === itemId) {
      resetQuickMemoForm(state.selectedDate);
    }
    await StorageManager.saveItems(state.items);
    renderCalendar();
    renderDaySheetContent(state.selectedDate);
    showToast('일정을 삭제했습니다');
  }

  /* =======================================================================
   * 빠른 월·연도 이동 / 연간 빨간날 / 키워드 검색 / 설정 백업·복원
   * ======================================================================= */
  function shiftMonth(delta) {
    let y = state.viewYear;
    let m = state.viewMonth + delta;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    state.viewYear = y;
    state.viewMonth = m;
    renderCalendar();
  }

  function renderMonthPicker() {
    el.pickerYearLabel.textContent = `${state.pickerYear}년`;
    el.pickerMonthGrid.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'month-grid-btn' +
        (state.pickerYear === state.viewYear && m === state.viewMonth ? ' is-active' : '');
      btn.textContent = `${m}월`;
      btn.addEventListener('click', () => {
        state.viewYear = state.pickerYear;
        state.viewMonth = m;
        renderCalendar();
        closeAllSheets();
      });
      el.pickerMonthGrid.appendChild(btn);
    }
  }

  function renderYearlyHolidays() {
    const year = state.holidayModalYear;
    el.holidayYearLabel.textContent = `${year}년`;
    const map = KoreanHolidayEngine.getYearHolidays(year);
    const entries = Array.from(map.values());
    el.holidaysCountSummary.textContent = `${year}년 주요 공휴일·대체공휴일 총 ${entries.length}일`;

    el.yearlyHolidaysList.innerHTML = '';
    for (const h of entries) {
      const [, m, d] = h.date.split('-').map(Number);
      const dow = WEEKDAY_KO[KoreanHolidayEngine.getDayOfWeekFromYMD(h.date)];
      const streak = KoreanHolidayEngine.getContinuousOffDaysCount(h.date);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-row-card';
      btn.innerHTML = `
        <div>
          <div class="list-row-date">${m}월 ${d}일 (${dow}) · ${formatDdayText(h.date)}</div>
          <div class="list-row-title is-red">${h.label}</div>
        </div>
        ${streak >= 3 ? `<span class="streak-badge">${streak}일 연휴</span>` : ''}
      `;
      btn.addEventListener('click', () => {
        openDaySheet(h.date, false);
      });
      el.yearlyHolidaysList.appendChild(btn);
    }
  }

  function renderSearchResults(keyword) {
    const q = keyword.trim().toLowerCase();
    el.searchResultsList.innerHTML = '';

    if (!q) {
      el.searchResultsList.innerHTML = '<div class="empty-day-state">찾고 싶은 일정 제목, 메모 또는 공휴일 이름을 입력하세요.</div>';
      return;
    }

    const hits = [];

    // 1. 사용자 일정·메모 검색
    for (const item of state.items) {
      const hay = `${item.title} ${item.note || ''}`.toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          date: item.startDate,
          title: item.title,
          sub: item.note || getRepeatBadgeLabel(item) || '저장된 일정',
          isRed: false
        });
      }
    }

    // 2. 현재 연도 전후(viewYear-1 ~ viewYear+2) 공휴일 검색
    for (let y = state.viewYear - 1; y <= state.viewYear + 2; y++) {
      const hMap = KoreanHolidayEngine.getYearHolidays(y);
      for (const h of hMap.values()) {
        if (h.label.toLowerCase().includes(q)) {
          hits.push({
            date: h.date,
            title: h.label,
            sub: `${y}년 대한민국 공휴일`,
            isRed: true
          });
        }
      }
    }

    hits.sort((a, b) => a.date.localeCompare(b.date));

    if (hits.length === 0) {
      el.searchResultsList.innerHTML = '<div class="empty-day-state">일치하는 일정이나 공휴일이 없습니다.</div>';
      return;
    }

    for (const hit of hits) {
      const [y, m, d] = hit.date.split('-').map(Number);
      const dow = WEEKDAY_KO[KoreanHolidayEngine.getDayOfWeekFromYMD(hit.date)];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-row-card';
      btn.innerHTML = `
        <div>
          <div class="list-row-date">${y}년 ${m}월 ${d}일 (${dow}) · ${hit.sub}</div>
          <div class="list-row-title ${hit.isRed ? 'is-red' : ''}">${escapeHtml(hit.title)}</div>
        </div>
      `;
      btn.addEventListener('click', () => {
        openDaySheet(hit.date, false);
      });
      el.searchResultsList.appendChild(btn);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSettingsSheet() {
    el.themePresetGrid.innerHTML = '';
    Object.entries(THEME_PRESETS).forEach(([key, info]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-chip-btn' + (state.prefs.theme === key ? ' is-active' : '');
      btn.innerHTML = `<span class="theme-chip-dot" style="background:${info.hex}"></span><span>${info.name}</span>`;
      btn.addEventListener('click', async () => {
        state.prefs.theme = key;
        applyPreferences();
        await StorageManager.savePrefs(state.prefs);
        renderSettingsSheet();
        renderCalendar();
      });
      el.themePresetGrid.appendChild(btn);
    });

    el.lunarDisplayModeSelect.value = state.prefs.lunarMode;
    el.appearanceModeSelect.value = state.prefs.appearance;
    el.backupStatsBox.textContent = `현재 기기에 저장된 일정 · 메모 총 ${state.items.length}개`;
  }

  function buildBackupPayload() {
    return JSON.stringify(
      {
        app: APP_CONFIG.appTitle || '빨간달력',
        backupVersion: 1,
        exportedAt: new Date().toISOString(),
        prefs: state.prefs,
        items: state.items
      },
      null,
      2
    );
  }

  async function importBackupJSON(rawText) {
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (_) {
      showToast('올바른 JSON 백업 형식이 아닙니다');
      return;
    }

    const incomingItems = Array.isArray(parsed) ? parsed : parsed?.items;
    if (!Array.isArray(incomingItems)) {
      showToast('백업 데이터에서 일정 목록을 찾을 수 없습니다');
      return;
    }

    const sanitized = incomingItems
      .filter((x) => x && typeof x.title === 'string' && typeof x.startDate === 'string')
      .map((x) => ({
        id: x.id || `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: x.title.trim().slice(0, 120),
        startDate: x.startDate,
        endDate: x.endDate || x.startDate,
        repeat: x.repeat || 'none',
        lunarMonth: x.lunarMonth || null,
        lunarDay: x.lunarDay || null,
        color: x.color || EVENT_COLORS[0],
        note: typeof x.note === 'string' ? x.note.slice(0, 500) : '',
        completedDates: Array.isArray(x.completedDates) ? x.completedDates : [],
        createdAt: x.createdAt || Date.now()
      }));

    const mode = el.restoreModeSelect.value;
    if (mode === 'replace') {
      state.items = sanitized;
    } else {
      const mapById = new Map(state.items.map((item) => [item.id, item]));
      for (const item of sanitized) {
        mapById.set(item.id, item);
      }
      state.items = Array.from(mapById.values());
    }

    await StorageManager.saveItems(state.items);
    renderSettingsSheet();
    renderCalendar();
    showToast(`일정 ${sanitized.length}개를 성공적으로 복원했습니다`);
  }

  async function copyTextSafe(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  /* =======================================================================
   * 선물 메시지 카드 제어
   * ======================================================================= */
  function setupGiftCard() {
    const gift = APP_CONFIG.giftWelcome;
    if (!gift || !gift.enabled) {
      el.openGiftBtn.hidden = true;
      el.giftModalWrap.hidden = true;
      return;
    }

    el.openGiftBtn.hidden = false;
    el.giftModalTitle.textContent = gift.title || '선물 메시지';
    el.giftModalMessage.textContent = gift.message || '';
    el.giftModalSender.textContent = gift.sender || '';
    el.giftModalSender.hidden = !gift.sender;

    if (!state.prefs.giftSeen) {
      el.giftModalWrap.hidden = false;
    }
  }

  /* =======================================================================
   * 터치 제스처 (달력 좌우 스와이프 월 이동 + 바텀시트 아래로 끌어 닫기)
   * ======================================================================= */
  function bindTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;

    el.calendarViewport.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    el.calendarViewport.addEventListener(
      'touchend',
      (e) => {
        if (e.changedTouches.length !== 1) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          shiftMonth(dx < 0 ? 1 : -1);
        }
      },
      { passive: true }
    );

    // 바텀시트 상단 드래그 핸들 스와이프 다운 닫기
    document.querySelectorAll('.sheet-drag-zone').forEach((zone) => {
      let dragStartY = 0;
      zone.addEventListener(
        'touchstart',
        (e) => {
          dragStartY = e.touches[0].clientY;
        },
        { passive: true }
      );
      zone.addEventListener(
        'touchend',
        (e) => {
          const deltaY = e.changedTouches[0].clientY - dragStartY;
          if (deltaY > 45) closeAllSheets();
        },
        { passive: true }
      );
    });
  }

  /* =======================================================================
   * 이벤트 바인딩 및 초기화
   * ======================================================================= */
  function bindEvents() {
    // 달력 날짜 셀 탭 (이벤트 위임): 탭 즉시 초간편 메모 바텀시트 오픈
    el.calendarWeeks.addEventListener('click', (e) => {
      const cell = e.target.closest('.day-cell');
      if (!cell || !cell.dataset.ymd) return;
      openDaySheet(cell.dataset.ymd, false);
    });

    el.quickOpenSheetBtn.addEventListener('click', () => {
      openDaySheet(state.selectedDate, true);
    });

    el.prevMonthBtn.addEventListener('click', () => shiftMonth(-1));
    el.nextMonthBtn.addEventListener('click', () => shiftMonth(1));

    el.goTodayBtn.addEventListener('click', () => {
      const nowYMD = getTodayYMD();
      state.viewYear = Number(nowYMD.slice(0, 4));
      state.viewMonth = Number(nowYMD.slice(5, 7));
      state.selectedDate = nowYMD;
      renderCalendar();
      showToast('오늘 날짜로 이동했습니다');
    });

    el.monthPickerBtn.addEventListener('click', () => {
      state.pickerYear = state.viewYear;
      renderMonthPicker();
      openSheet(el.monthPickerSheet);
    });
    el.pickerPrevYearBtn.addEventListener('click', () => {
      state.pickerYear -= 1;
      renderMonthPicker();
    });
    el.pickerNextYearBtn.addEventListener('click', () => {
      state.pickerYear += 1;
      renderMonthPicker();
    });

    el.openHolidaysBtn.addEventListener('click', () => {
      state.holidayModalYear = state.viewYear;
      renderYearlyHolidays();
      openSheet(el.holidaysSheet);
    });
    el.holidayPrevYearBtn.addEventListener('click', () => {
      state.holidayModalYear -= 1;
      renderYearlyHolidays();
    });
    el.holidayNextYearBtn.addEventListener('click', () => {
      state.holidayModalYear += 1;
      renderYearlyHolidays();
    });

    el.openSearchBtn.addEventListener('click', () => {
      el.searchKeywordInput.value = '';
      renderSearchResults('');
      openSheet(el.searchSheet);
      setTimeout(() => el.searchKeywordInput.focus(), 250);
    });
    el.searchKeywordInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    el.openSettingsBtn.addEventListener('click', () => {
      el.pasteRestoreArea.hidden = true;
      renderSettingsSheet();
      openSheet(el.settingsSheet);
    });

    el.lunarDisplayModeSelect.addEventListener('change', async (e) => {
      state.prefs.lunarMode = e.target.value;
      await StorageManager.savePrefs(state.prefs);
      renderCalendar();
    });

    el.appearanceModeSelect.addEventListener('change', async (e) => {
      state.prefs.appearance = e.target.value;
      applyPreferences();
      await StorageManager.savePrefs(state.prefs);
    });

    el.downloadBackupBtn.addEventListener('click', () => {
      const json = buildBackupPayload();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-backup-${getTodayYMD()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('백업 파일 다운로드를 시작했습니다');
    });

    el.copyBackupClipboardBtn.addEventListener('click', async () => {
      const ok = await copyTextSafe(buildBackupPayload());
      showToast(ok ? '백업 데이터가 클립보드에 복사되었습니다' : '복사에 실패했습니다. 파일 다운로드를 이용해 주세요');
    });

    el.uploadBackupInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        importBackupJSON(String(reader.result || ''));
        el.uploadBackupInput.value = '';
      };
      reader.readAsText(file, 'utf-8');
    });

    el.togglePasteRestoreBtn.addEventListener('click', () => {
      el.pasteRestoreArea.hidden = !el.pasteRestoreArea.hidden;
      if (!el.pasteRestoreArea.hidden) el.pasteRestoreTextarea.focus();
    });

    el.applyPasteRestoreBtn.addEventListener('click', () => {
      const raw = el.pasteRestoreTextarea.value.trim();
      if (!raw) {
        showToast('붙여넣은 백업 텍스트가 없습니다');
        return;
      }
      importBackupJSON(raw);
      el.pasteRestoreTextarea.value = '';
      el.pasteRestoreArea.hidden = true;
    });

    el.quickMemoForm.addEventListener('submit', handleSaveMemo);

    el.activeColorDotBtn.addEventListener('click', () => {
      const curIdx = EVENT_COLORS.indexOf(state.activeColor);
      state.activeColor = EVENT_COLORS[(curIdx + 1) % EVENT_COLORS.length];
      renderColorSwatches();
    });

    el.toggleDetailOptionsBtn.addEventListener('click', () => {
      const isHidden = el.detailOptionsPanel.hidden;
      el.detailOptionsPanel.hidden = !isHidden;
      el.toggleDetailOptionsBtn.setAttribute('aria-expanded', String(isHidden));
      el.toggleDetailOptionsBtn.textContent = isHidden
        ? '기간·반복·메모 접기 ▴'
        : '기간·반복·메모 설정 ▾';
    });

    el.cancelEditBtn.addEventListener('click', () => {
      resetQuickMemoForm(state.selectedDate);
    });

    el.sheetBackdrop.addEventListener('click', closeAllSheets);
    document.querySelectorAll('[data-close-sheet]').forEach((btn) => {
      btn.addEventListener('click', closeAllSheets);
    });

    el.openGiftBtn.addEventListener('click', () => {
      el.giftModalWrap.hidden = false;
    });
    el.closeGiftModalBtn.addEventListener('click', async () => {
      el.giftModalWrap.hidden = true;
      if (!state.prefs.giftSeen) {
        state.prefs.giftSeen = true;
        await StorageManager.savePrefs(state.prefs);
      }
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (state.prefs.appearance === 'system') applyPreferences();
      });
    }

    bindTouchGestures();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  async function init() {
    const loaded = await StorageManager.loadAll();
    state.items = loaded.items;
    state.prefs = loaded.prefs;

    applyPreferences();
    bindEvents();
    renderCalendar();
    setupGiftCard();
    registerServiceWorker();
  }

  init();
})();
