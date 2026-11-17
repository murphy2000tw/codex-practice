(() => {
  const key = 'japanese-kana-listening-results-v1';
  function read() {
    try {
      const records = JSON.parse(window.localStorage.getItem(key) || '[]');
      if (!Array.isArray(records)) return [];
      return records.filter(record => record && ['hiragana', 'katakana'].includes(record.kind)
        && typeof record.completedAt === 'string' && Number.isFinite(Date.parse(record.completedAt))
        && record.total === 92 && Number.isInteger(record.correct) && record.correct >= 0 && record.correct <= 92
        && record.accuracy === Math.round(record.correct / 92 * 100))
        .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)).slice(0, 20);
    } catch { return []; }
  }
  window.kanaListeningResults = {
    read,
    save(record) {
      try {
        const records = [record, ...read()].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)).slice(0, 20);
        window.localStorage.setItem(key, JSON.stringify(records));
        return true;
      } catch { return false; }
    },
    render() {
      const list = document.querySelector('#kana-listening-results-list');
      if (!list) return;
      list.replaceChildren();
      const records = read();
      if (!records.length) {
        const empty = document.createElement('p');
        empty.textContent = '尚無完成紀錄。完成一次 92 題的聽音練習後，成績會顯示在這裡。';
        list.appendChild(empty);
      }
      records.forEach(record => {
        const card = document.createElement('article');
        card.className = 'sentence-composition-card';
        const title = document.createElement('h3');
        title.textContent = `${record.kind === 'hiragana' ? '平假名' : '片假名'}聽音練習`;
        const time = document.createElement('time');
        time.dateTime = record.completedAt;
        time.textContent = new Date(record.completedAt).toLocaleString('zh-TW', { hour12: false });
        const stats = document.createElement('p');
        stats.textContent = `總題數：${record.total} 題　答對：${record.correct} 題　正確率：${record.accuracy}%`;
        card.append(title, time, stats);
        list.appendChild(card);
      });
    },
  };
})();
