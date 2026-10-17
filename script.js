const games = [
  {
    id: "minecraft",
    name: "Minecraft",
    genre: "Пісочниця · Пригоди",
    price: "₴899",
    rating: "4.9",
    art: "minecraft",
    label: "Популярне",
    description:
      "Досліджуй безмежний світ, будуй усе, що підкаже уява, та вирушай у пригоди разом із друзями.",
    pages: ["library", "wishlist", "new"],
  },
  {
    id: "stardew",
    name: "Stardew Valley",
    genre: "Симулятор · Інді",
    price: "₴349",
    rating: "4.8",
    art: "stardew",
    label: "Рекомендація",
    description:
      "Почни нове життя на фермі: вирощуй урожай, знайомся з мешканцями долини та відкривай її таємниці.",
    pages: ["library", "wishlist", "new"],
  },
  {
    id: "hades",
    name: "Hades",
    genre: "Екшн · Roguelike",
    price: "₴599",
    rating: "4.9",
    art: "hades",
    label: "Вибір редакції",
    description:
      "Кинь виклик богу мертвих у динамічній пригоді, де кожна спроба відкриває нову історію.",
    pages: ["library", "wishlist"],
  },
  {
    id: "portal",
    name: "Portal 2",
    genre: "Головоломка · Пригоди",
    price: "₴279",
    rating: "4.9",
    art: "portal",
    label: "Класика",
    description:
      "Розв'язуй нестандартні головоломки за допомогою портальної гармати та перевір свої навички.",
    pages: ["library", "wishlist", "new"],
  },
  {
    id: "celeste",
    name: "Celeste",
    genre: "Платформер · Інді",
    price: "₴429",
    rating: "4.8",
    art: "celeste",
    label: "Інді-хіт",
    description:
      "Допоможи Мадлен підкорити гору Селеста в точному платформері про наполегливість і сміливість.",
    pages: ["library", "wishlist"],
  },
  {
    id: "hollow",
    name: "Hollow Knight",
    genre: "Метроїдванія · Екшн",
    price: "₴399",
    rating: "4.9",
    art: "hollow",
    label: "Пригода",
    description:
      "Відкрий підземне королівство комах, повне таємниць, небезпечних ворогів і прихованих шляхів.",
    pages: ["library", "wishlist", "new"],
  },
];

const pageContent = document.querySelector("#page-content");
const searchInput = document.querySelector("#game-search");
const navigation = document.querySelector(".navigation");
const dialog = document.querySelector("#game-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogArt = document.querySelector("#dialog-art");
const favoriteIds = new Set(readStoredFavorites());
let activePage = "home";
let searchQuery = "";

function readStoredFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem("game-space-favorites") || "[]");
    return Array.isArray(value) ? value.filter((id) => typeof id === "string") : [];
  } catch (error) {
    console.warn("Не вдалося прочитати список бажаного.", error);
    return [];
  }
}

function storeFavorites() {
  try {
    localStorage.setItem("game-space-favorites", JSON.stringify([...favoriteIds]));
  } catch (error) {
    console.warn("Не вдалося зберегти список бажаного.", error);
  }
}

function readStoredSettings() {
  try {
    const value = JSON.parse(localStorage.getItem("game-space-settings") || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch (error) {
    console.warn("Не вдалося прочитати налаштування.", error);
    return {};
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function gameCard(game) {
  const isFavorite = favoriteIds.has(game.id);
  return `
    <article class="game-card">
      <button class="game-card__art-button" type="button" data-open-game="${game.id}" aria-label="Докладніше про ${escapeHtml(game.name)}">
        <span class="game-art game-art--${game.art}">
          <span class="game-art__title">${escapeHtml(game.name)}</span>
        </span>
        <span class="game-card__tag">${escapeHtml(game.label)}</span>
      </button>
      <button
        class="favorite-button${isFavorite ? " is-favorite" : ""}"
        type="button"
        data-favorite="${game.id}"
        aria-label="${isFavorite ? "Прибрати з" : "Додати до"} бажаного: ${escapeHtml(game.name)}"
        aria-pressed="${isFavorite}"
      >${isFavorite ? "★" : "☆"}</button>
      <div class="game-card__info">
        <div class="game-card__topline">
          <h3 class="game-card__title">${escapeHtml(game.name)}</h3>
          <span class="game-card__rating" aria-label="Рейтинг ${game.rating} з 5">★ ${game.rating}</span>
        </div>
        <p class="game-card__meta">${escapeHtml(game.genre)}</p>
        <div class="game-card__bottom">
          <span class="game-card__price">${escapeHtml(game.price)}</span>
          <button class="button button--quiet" type="button" data-open-game="${game.id}">Переглянути</button>
        </div>
      </div>
    </article>
  `;
}

function heading(title, subtitle, eyebrow = "GAME SPACE") {
  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p class="page-subtitle">${subtitle}</p>
      </div>
    </div>
  `;
}

function filteredGames(page) {
  return games.filter((game) => {
    const pageMatches =
      page === "library" ||
      (page === "wishlist" && favoriteIds.has(game.id)) ||
      (page === "new" && game.pages.includes("new"));
    const queryMatches = `${game.name} ${game.genre}`.toLowerCase().includes(searchQuery);
    return pageMatches && queryMatches;
  });
}

function renderGameGrid(page) {
  const results = filteredGames(page);
  if (!results.length) {
    const message =
      page === "wishlist" && !searchQuery
        ? "У списку поки порожньо. Додай гру, натиснувши на зірочку."
        : "Спробуй змінити пошуковий запит.";
    return `<div class="empty-state"><span class="empty-state__icon" aria-hidden="true">✦</span>${message}</div>`;
  }
  return `<div class="game-grid">${results.map(gameCard).join("")}</div>`;
}

function renderHome() {
  const featured = games[0];
  const recommendations = games.slice(1, 4);
  return `
    ${heading("Головна", "Твоя наступна велика пригода починається тут.", "РАДІ БАЧИТИ ЗНОВУ")}
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__art" aria-hidden="true"></div>
      <div class="hero__content">
        <span class="hero__label">ГРА ТИЖНЯ</span>
        <h1 id="hero-title">${featured.name}</h1>
        <p class="hero__description">${featured.description}</p>
        <div class="hero__actions">
          <button class="button button--primary" type="button" data-open-game="${featured.id}">Переглянути гру</button>
          <span class="hero__price">${featured.price}</span>
        </div>
        <div class="genre-row">
          <span class="genre-chip">Вибір спільноти</span>
          <span class="genre-chip">Пригоди</span>
          <span class="genre-chip">★ ${featured.rating}</span>
        </div>
      </div>
    </section>
    <div class="section-title">
      <span>Рекомендуємо тобі</span>
      <button class="section-title__link" type="button" data-page="new">Усі новинки →</button>
    </div>
    <div class="game-grid">${recommendations.map(gameCard).join("")}</div>
  `;
}

function renderSettings() {
  return `
    ${heading("Налаштування", "Налаштуй Game Space під себе.", "ТВІЙ ПРОФІЛЬ")}
    <div class="settings-layout">
      <nav class="settings-tabs" aria-label="Розділи налаштувань">
        <button class="settings-tab is-active" type="button" data-settings-tab="general">Загальні</button>
        <button class="settings-tab" type="button" data-settings-tab="interface">Інтерфейс</button>
        <button class="settings-tab" type="button" data-settings-tab="notifications">Сповіщення</button>
        <button class="settings-tab" type="button" data-settings-tab="privacy">Приватність</button>
      </nav>
      <section class="settings-panel">
        <h2>Загальні налаштування</h2>
        <div class="settings-grid">
          <label class="setting-field">
            Мова
            <select data-setting="language">
              <option>Українська</option>
              <option>English</option>
              <option>Polski</option>
            </select>
          </label>
          <label class="setting-field">
            Регіон
            <select data-setting="region">
              <option>Україна</option>
              <option>Європа</option>
              <option>США</option>
            </select>
          </label>
          <label class="setting-field setting-field--wide">
            Обліковий запис
            <select data-setting="account">
              <option>Профіль гравця · varen</option>
              <option>Керування обліковим записом</option>
            </select>
          </label>
        </div>
        <div class="settings-divider"></div>
        <div class="toggle-row">
          <span>Запускати разом із системою<small>Game Space відкриватиметься після входу</small></span>
          <label class="switch"><input type="checkbox" data-setting="startup" /><span class="switch__track"></span></label>
        </div>
        <div class="toggle-row">
          <span>Показувати статус у мережі<small>Друзі бачитимуть, коли ти граєш</small></span>
          <label class="switch"><input type="checkbox" data-setting="online" checked /><span class="switch__track"></span></label>
        </div>
      </section>
    </div>
  `;
}

function render() {
  document.querySelectorAll(".navigation__item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.page === activePage);
    if (item.dataset.page === activePage) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  const pageTitles = {
    library: ["Бібліотека", "Усі твої ігри — в одному місці.", "ТВОЇ ІГРИ"],
    wishlist: ["Бажане", "Ігри, до яких хочеться повернутися.", "СПИСОК БАЖАНОГО"],
    new: ["Новинки", "Свіжі ігри та улюблені відкриття.", "ЩО НОВОГО"],
  };

  if (activePage === "home") {
    pageContent.innerHTML = renderHome();
  } else if (activePage === "settings") {
    pageContent.innerHTML = renderSettings();
    const settings = readStoredSettings();
    pageContent.querySelectorAll("[data-setting]").forEach((control) => {
      const value = settings[control.dataset.setting];
      if (control.type === "checkbox" && typeof value === "boolean") {
        control.checked = value;
      } else if (
        control.tagName === "SELECT" &&
        typeof value === "string" &&
        [...control.options].some((option) => option.value === value)
      ) {
        control.value = value;
      }
    });
  } else {
    const [title, subtitle, eyebrow] = pageTitles[activePage];
    const count = filteredGames(activePage).length;
    pageContent.innerHTML = `
      ${heading(title, `${subtitle} ${count} ${count === 1 ? "гра" : "ігор"}.`, eyebrow)}
      ${renderGameGrid(activePage)}
    `;
  }

  searchInput.value = searchQuery;
  searchInput.closest(".search").hidden = activePage === "settings";
}

function openGame(gameId) {
  const game = games.find((item) => item.id === gameId);
  if (!game) return;
  dialogTitle.textContent = game.name;
  dialogDescription.textContent = game.description;
  dialogArt.className = `game-dialog__art game-art game-art--${game.art}`;
  dialogArt.innerHTML = `<span class="game-art__title">${escapeHtml(game.name)}</span>`;
  dialog.showModal();
}

navigation.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button) return;
  activePage = button.dataset.page;
  render();
});

pageContent.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    activePage = pageButton.dataset.page;
    render();
    return;
  }

  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const gameId = favoriteButton.dataset.favorite;
    if (favoriteIds.has(gameId)) {
      favoriteIds.delete(gameId);
    } else {
      favoriteIds.add(gameId);
    }
    storeFavorites();
    render();
    return;
  }

  const gameButton = event.target.closest("[data-open-game]");
  if (gameButton) openGame(gameButton.dataset.openGame);

  const tab = event.target.closest("[data-settings-tab]");
  if (tab) {
    pageContent.querySelectorAll("[data-settings-tab]").forEach((item) => {
      item.classList.toggle("is-active", item === tab);
    });
    pageContent.querySelector(".settings-panel h2").textContent =
      `${tab.textContent.trim()} налаштування`;
  }
});

pageContent.addEventListener("change", (event) => {
  const control = event.target.closest("[data-setting]");
  if (!control) return;
  try {
    const saved = JSON.parse(localStorage.getItem("game-space-settings") || "{}");
    const settings = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    settings[control.dataset.setting] =
      control.type === "checkbox" ? control.checked : control.value;
    localStorage.setItem("game-space-settings", JSON.stringify(settings));
  } catch (error) {
    console.warn("Не вдалося зберегти налаштування.", error);
  }
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  if (activePage === "home") activePage = "library";
  render();
  searchInput.focus();
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (activePage === "settings") {
      activePage = "library";
      render();
    }
    searchInput.focus();
  }
});

document.querySelector(".game-dialog__close").addEventListener("click", () => dialog.close());
document.querySelector("#dialog-action").addEventListener("click", () => {
  activePage = "library";
  dialog.close();
  render();
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector(".profile").addEventListener("click", () => {
  activePage = "settings";
  render();
});

render();
