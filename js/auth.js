// ============================================================
//  ССЫЛКА НА ТВОЮ БАЗУ (Google Apps Script)
// ============================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbxWEtEDa-_VrjsXD_tQek74tMgfnkaZIoUMJoWSME0CShP6oDhVkAtXWNGQB7dWLYRo/exec';

// ============================================================
//  1. АВТОРИЗАЦИЯ (вход)
// ============================================================
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Останавливаем перезагрузку страницы

  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');
  const errorEl = document.getElementById('loginError');

  if (!loginInput || !passwordInput) {
    alert("Ошибка на странице: не найдены поля ввода логина или пароля.");
    return;
  }

  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();

  errorEl.textContent = ''; // Очищаем прошлые ошибки
  console.log("1. Пытаюсь войти. Логин:", login); // Вывод в консоль (F12)

  try {
    // Формируем ссылку для запроса
    const url = `${API_URL}?action=login&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`;
    console.log("2. Отправляю запрос на Google...");
    
    const res = await fetch(url);
    const data = await res.json();
    
    console.log("3. Ответ от Google:", data); // Смотрим, что ответил скрипт

    if (data.success) {
      // Если всё верно — сохраняем данные ученика и переходим в кабинет
      localStorage.setItem('currentUser', JSON.stringify({
        login: login, 
        name: data.name, 
        grade: data.grade
      }));
      window.location.href = 'dashboard.html';
    } else {
      // Если скрипт вернул success: false
      errorEl.textContent = 'Неверный логин или пароль';
    }
  } catch (err) {
    // Если произошла ошибка сети или скрипт недоступен
    errorEl.textContent = 'Ошибка соединения. Попробуйте позже.';
    console.error("ОШИБКА ЗАПРОСА:", err);
  }
});

// ============================================================
//  2. ЗАЩИТА СТРАНИЦ (кабинет и домашки)
// ============================================================
const protectedPages = ['dashboard.html', 'homework.html'];
const currentPage = window.location.pathname.split('/').pop();

if (protectedPages.includes(currentPage)) {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  
  if (!user) {
    // Если пользователь не вошел — выкидываем на страницу логина
    window.location.href = 'login.html';
  } else {
    // Если вошел — показываем его имя
    const nameEl = document.getElementById('studentName');
    if (nameEl) nameEl.textContent = user.name || user.login;
  }
}

// ============================================================
//  3. ВЫХОД ИЗ АККАУНТА
// ============================================================
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('currentUser'); // Очищаем сессию
  window.location.href = 'index.html';    // Кидаем на главную
});

// ============================================================
//  4. ЗАМЕТКИ В КАБИНЕТЕ (Сохранение)
// ============================================================
document.getElementById('saveNotes')?.addEventListener('click', async () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!user) return;

  const notes = document.getElementById('notes').value;
  console.log("Сохраняю заметку для:", user.login);

  try {
    const url = `${API_URL}?action=saveNotes&login=${encodeURIComponent(user.login)}&notes=${encodeURIComponent(notes)}`;
    await fetch(url);

    // Показываем надпись "Сохранено" на 2 секунды
    const savedEl = document.getElementById('notesSaved');
    if (savedEl) {
      savedEl.style.display = 'inline';
      setTimeout(() => { savedEl.style.display = 'none'; }, 2000);
    }
  } catch (err) {
    console.error('Не удалось сохранить заметку', err);
  }
});

// ============================================================
//  5. ЗАМЕТКИ В КАБИНЕТЕ (Загрузка при открытии)
// ============================================================
window.addEventListener('load', async () => {
  // Работает только на странице dashboard.html
  if (!window.location.pathname.includes('dashboard')) return;

  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!user) return;

  try {
    const url = `${API_URL}?action=getNotes&login=${encodeURIComponent(user.login)}`;
    const res = await fetch(url);
    const data = await res.json();

    const notesEl = document.getElementById('notes');
    if (notesEl && data.notes) {
      notesEl.value = data.notes; // Подставляем заметку из таблицы
    }
  } catch (err) {
    console.error('Не удалось загрузить заметку', err);
  }
});
