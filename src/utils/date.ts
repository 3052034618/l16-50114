export const formatDate = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
};

export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm');
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getWeekDates = (): { start: string; end: string; dates: string[] } => {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(formatDate(d));
  }

  return {
    start: dates[0],
    end: dates[6],
    dates,
  };
};

export const getMonthDates = (): { start: string; end: string; dates: string[] } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    dates.push(formatDate(d));
  }

  return {
    start: dates[0],
    end: dates[daysInMonth - 1],
    dates,
  };
};

export const getChineseDate = (): string => {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDay = weekDays[now.getDay()];
  return `${month}月${day}日 ${weekDay}`;
};

export const getMealType = (): 'lunch' | 'dinner' => {
  const hour = new Date().getHours();
  return hour < 14 ? 'lunch' : 'dinner';
};

export const getMealTypeName = (type: 'lunch' | 'dinner' | 'all'): string => {
  switch (type) {
    case 'lunch':
      return '午餐';
    case 'dinner':
      return '晚餐';
    case 'all':
      return '午晚餐';
  }
};
