// === КАЛЕНДАРЬ И СЛОТЫ ===
let bookedSlots = {
  "2025-04-10": ["12:00","15:00"],
  "2025-04-12": ["10:00","11:00"],
  "2025-04-15": ["14:00"],
  "2025-04-20": ["13:00","17:00"],
  "2025-04-25": ["09:00","18:00"]
};

let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
const today = new Date();
today.setHours(0,0,0,0);

function formatDateKey(year, month, day) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function isDateDisabled(year, month, day) {
  const checkDate = new Date(year, month, day);
  if (checkDate < today) return true;
  const allTimes = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
  const booked = bookedSlots[formatDateKey(year, month, day)] || [];
  return booked.length >= allTimes.length;
}

function renderCalendar() {
  const calendarDiv = document.getElementById('calendarContainer');
  if (!calendarDiv) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `<div class="month-nav">
    <button id="prevMonthBtn"><i class="fas fa-chevron-left"></i></button>
    <span class="text-lg font-semibold">${new Date(year, month).toLocaleString('ru', { month: 'long', year: 'numeric' })}</span>
    <button id="nextMonthBtn"><i class="fas fa-chevron-right"></i></button>
  </div><div class="calendar">`;

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  daysOfWeek.forEach(day => { html += `<div class="text-center text-sm text-gray-400">${day}</div>`; });

  let startOffset = (firstDay === 0 ? 6 : firstDay - 1);
  for (let i = 0; i < startOffset; i++) html += `<div></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(year, month, d);
    const disabled = isDateDisabled(year, month, d);
    const isToday = (year === today.getFullYear() && month === today.getMonth() && d === today.getDate());
    const isSelected = (selectedDate === dateKey);
    let classes = `calendar-day ${disabled ? 'disabled-day' : ''} ${isSelected ? 'selected-day' : ''} ${isToday ? 'today' : ''}`;
    html += `<div class="${classes}" data-date="${dateKey}" data-disabled="${disabled}">${d}</div>`;
  }
  html += `</div>`;
  calendarDiv.innerHTML = html;

  document.querySelectorAll('.calendar-day').forEach(day => {
    if (day.dataset.disabled !== 'true') {
      day.addEventListener('click', () => selectDate(day.dataset.date));
    }
  });

  document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    if (selectedDate) {
      const [year, month] = selectedDate.split('-');
      if (currentDate.getFullYear() != Number(year) || currentDate.getMonth() != Number(month)-1) {
        selectedDate = null;
        selectedTime = null;
        document.getElementById('selectedDate').value = '';
        document.getElementById('selectedTime').value = '';
      }
    }
    renderTimeSlots();
  });
  document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    if (selectedDate) {
      const [year, month] = selectedDate.split('-');
      if (currentDate.getFullYear() != Number(year) || currentDate.getMonth() != Number(month)-1) {
        selectedDate = null;
        selectedTime = null;
        document.getElementById('selectedDate').value = '';
        document.getElementById('selectedTime').value = '';
      }
    }
    renderTimeSlots();
  });
}

function selectDate(date) {
  selectedDate = date;
  selectedTime = null;
  document.getElementById('selectedDate').value = date;
  document.getElementById('selectedTime').value = '';
  renderCalendar();
  renderTimeSlots();
}

function renderTimeSlots() {
  const container = document.getElementById('timeSlotsContainer');
  if (!container) return;
  if (!selectedDate) {
    container.innerHTML = '';
    return;
  }
  const allTimes = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
  const booked = bookedSlots[selectedDate] || [];
  const availableTimes = allTimes.filter(t => !booked.includes(t));
  if (availableTimes.length === 0) {
    container.innerHTML = '<p class="text-center text-red-400 mt-2">Нет свободных слотов на этот день</p>';
    return;
  }
  let slotsHtml = `<div class="time-slots">`;
  availableTimes.forEach(time => {
    const isSelected = (selectedTime === time);
    slotsHtml += `<div class="time-slot ${isSelected ? 'selected-time' : ''}" data-time="${time}">${time}</div>`;
  });
  slotsHtml += `</div>`;
  container.innerHTML = slotsHtml;

  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      selectedTime = slot.dataset.time;
      document.getElementById('selectedTime').value = selectedTime;
      renderTimeSlots();
    });
  });
}

// Запуск календаря
renderCalendar();

// === ВЫБОР УСЛУГИ ===
function setService(serviceName) {
  const serviceInput = document.getElementById('service');
  if (serviceInput) serviceInput.value = serviceName;
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}
window.setService = setService;

// === ФОРМА БРОНИРОВАНИЯ ===
const bookingForm = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('Выберите дату и время');
      return;
    }
    alert('Бронирование отправлено! Мы свяжемся с вами.');
    if (formSuccess) formSuccess.classList.remove('hidden');
    setTimeout(() => { if (formSuccess) formSuccess.classList.add('hidden'); }, 4000);
  });
}

// === ОПЛАТА ===
const payButton = document.getElementById('payButton');
const paymentModal = document.getElementById('paymentModal');
const closePayment = document.getElementById('closePayment');
if (payButton) {
  payButton.addEventListener('click', () => {
    const name = document.getElementById('name')?.value;
    const phone = document.getElementById('phone')?.value;
    if (!name || !phone) {
      alert('Заполните имя и телефон');
      return;
    }
    if (!selectedDate || !selectedTime) {
      alert('Выберите дату и время');
      return;
    }
    if (paymentModal) paymentModal.classList.remove('hidden');
  });
}
if (closePayment) {
  closePayment.addEventListener('click', () => paymentModal.classList.add('hidden'));
}

// === КОНСУЛЬТАЦИЯ ===
const consultForm = document.getElementById('consultForm');
if (consultForm) {
  consultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Консультация запрошена! Менеджер свяжется с вами.');
    consultForm.reset();
  });
}

// === ОТЗЫВЫ ===
let reviews = JSON.parse(localStorage.getItem('famlReviews')) || [
  { name: 'Александр', text: 'Записал здесь свой первый трек. Ребята помогли с аранжировкой, всё объяснили. Результат превзошёл ожидания!', approved: true },
  { name: 'Елена', text: 'Делали песню в подарок мужу. Очень трогательно и профессионально. Спасибо команде FAML!', approved: true },
  { name: 'Марат', text: 'Лучшая студия в Казани. Оборудование топ, звукорежиссёры знают своё дело. Рекомендую.', approved: true }
];

function displayReviews() {
  const container = document.getElementById('reviewsList');
  if (!container) return;
  const approvedReviews = reviews.filter(r => r.approved);
  container.innerHTML = approvedReviews.map(r => `
    <div class="bg-gray-900/60 p-6 rounded-2xl fade-up">
      <i class="fas fa-star text-amber-500 mb-3"></i>
      <p class="text-gray-300">${r.text}</p>
      <p class="mt-4 font-bold">— ${r.name}</p>
    </div>
  `).join('');
}

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reviewName')?.value.trim();
    const text = document.getElementById('reviewText')?.value.trim();
    if (!name || !text) {
      alert('Заполните имя и отзыв');
      return;
    }
    reviews.push({ name, text, approved: false });
    localStorage.setItem('famlReviews', JSON.stringify(reviews));
    alert('Спасибо! Отзыв отправлен на модерацию.');
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewText').value = '';
  });
}
displayReviews();

// === ПОДСВЕТКА АКТИВНОЙ СТРАНИЦЫ ===
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  // Определяем активную страницу
  let activePage = 'index.html';
  if (currentPath.includes('pesni.html')) activePage = 'pesni.html';
  else if (currentPath.includes('studija-zvukozapisi.html')) activePage = 'studija-zvukozapisi.html';
  else if (currentPath.includes('muzyka-melodija.html')) activePage = 'muzyka-melodija.html';
  else if (currentPath.includes('baza-diktorov.html')) activePage = 'baza-diktorov.html';
  else if (currentPath === '/' || currentPath === '/index.html') activePage = 'index.html';

  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    // Сравниваем href с именем активной страницы
    if (href === activePage || (activePage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// === МОБИЛЬНОЕ МЕНЮ ===
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('closeMenuBtn');

  if (toggle && menu) {
    function openMenu() {
      menu.style.transform = 'translateY(0)';
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menu.style.transform = 'translateY(-100%)';
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Закрытие при клике на любую ссылку внутри меню
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && menu.style.transform === 'translateY(0px)') {
        closeMenu();
      }
    });
  }

  // Подсветка активной страницы
  setActiveNavLink();
});

// === СЛАЙДЕР С ПЕРЕКРЕСТНЫМ ЗАТУХАНИЕМ ===
const sliderContainer = document.querySelector('.slider-container-fade');
if (sliderContainer) {
  const images = document.querySelectorAll('.slider-fade-img');
  const prevBtn = document.getElementById('prevSlideFade');
  const nextBtn = document.getElementById('nextSlideFade');
  const dotsContainer = document.getElementById('sliderDotsFade');
  if (images.length && prevBtn && nextBtn && dotsContainer) {
    let currentIndex = 0;
    const totalImages = images.length;
    let interval;

    function showSlide(index) {
      images.forEach(img => img.classList.remove('active'));
      images[index].classList.add('active');
      document.querySelectorAll('.dot-fade').forEach((dot, i) => {
        if (i === index) dot.classList.add('dot-active', 'bg-amber-500', 'w-7');
        else dot.classList.remove('dot-active', 'bg-amber-500', 'w-7');
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalImages;
      showSlide(currentIndex);
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalImages) % totalImages;
      showSlide(currentIndex);
    }

    function startAutoSlide() {
      interval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
      clearInterval(interval);
    }

    // Создаём точки
    for (let i = 0; i < totalImages; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot-fade', 'w-2', 'h-2', 'rounded-full', 'bg-white/50', 'cursor-pointer', 'transition-all', 'duration-300');
      dot.addEventListener('click', () => {
        currentIndex = i;
        showSlide(currentIndex);
        stopAutoSlide();
        startAutoSlide();
      });
      dotsContainer.appendChild(dot);
    }

    showSlide(0);
    prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoSlide();
      startAutoSlide();
    });
    nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoSlide();
      startAutoSlide();
    });

    startAutoSlide();
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
  }
}

// === Плавный переход между страницами ===
document.addEventListener('DOMContentLoaded', function() {
  const transitionElement = document.querySelector('.page-transition');
  if (!transitionElement) return;

  // При загрузке страницы убираем класс fade-out, чтобы контент появился плавно
  transitionElement.classList.remove('fade-out');

  // Перехватываем клики по всем ссылкам внутри страницы
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    // Проверяем, что ссылка ведёт на ту же страницу (не внешний ресурс, не якорь)
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('javascript:')) {
      link.addEventListener('click', function(e) {
        // Если ссылка ведёт на другую страницу нашего сайта
        e.preventDefault();
        const targetUrl = href;
        // Добавляем класс fade-out и ждём окончания анимации
        transitionElement.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 300); // Длительность анимации
      });
    }
  });
});

// === ПЛАВНЫЙ ПЕРЕХОД МЕЖДУ СТРАНИЦАМИ ===
document.addEventListener('DOMContentLoaded', function() {
  // Все ссылки, которые ведут на страницы нашего сайта
  const links = document.querySelectorAll('a[href*=".html"], a[href="/"], a[href=""]');
  
  links.forEach(link => {
    // Исключаем ссылки с якорем (#) и внешние ссылки
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('http') || href.startsWith('#')) return;
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetUrl = this.href;
      
      // Добавляем класс для исчезновения
      document.body.classList.add('page-fade-out');
      
      // Через время, равное длительности анимации, переходим
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 400); // синхронизировано с transition-duration
    });
  });
});