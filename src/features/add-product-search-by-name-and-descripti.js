// Feature: Add product search by name and description to storefront
// Customers currently have no way to search for products on the storefront,
// forcing them to browse manually and leading to frustration and lost conversions.
// This feature adds a search bar that accepts a text query on submit and returns
// a results page showing all products whose name or description matches the query.

// Acceptance criteria:
// - A search bar with a submit button is visible on the storefront
// - Submitting a query returns a results page listing all products whose name OR
//   description contains the search term (case-insensitive)
// - If no products match, a clear 'no results found' message is displayed
// - Search results display at minimum the product name, image, and price

// --------------------------------------------------------------------------
// Validation
// --------------------------------------------------------------------------

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

/**
 * Validates a raw search query string.
 *
 * Rules:
 *  - Must be a non-empty string after trimming whitespace.
 *  - Must be at least MIN_QUERY_LENGTH characters long.
 *  - Must not exceed MAX_QUERY_LENGTH characters.
 *  - Must not consist solely of special characters / punctuation (no alphanumeric content).
 *
 * @param {string} query - The raw value supplied by the user.
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateSearchQuery(query) {
  if (typeof query !== "string" || query.trim().length === 0) {
    return { valid: false, error: "Search query must not be empty." };
  }

  const trimmed = query.trim();

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return {
      valid: false,
      error: `Search query must be at least ${MIN_QUERY_LENGTH} characters long.`,
    };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      error: `Search query must not exceed ${MAX_QUERY_LENGTH} characters.`,
    };
  }

  // Reject queries that contain no alphanumeric characters at all.
  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return {
      valid: false,
      error: "Search query must contain at least one letter or number.",
    };
  }

  return { valid: true, error: null };
}

// --------------------------------------------------------------------------
// Search logic
// --------------------------------------------------------------------------

/**
 * Searches a list of products by name and description.
 *
 * @param {Array<{ id: string|number, name: string, description: string, image: string, price: number }>} products
 * @param {string} rawQuery - The raw search string entered by the user.
 * @returns {{ results: Array, error: string|null }}
 */
function searchProducts(products, rawQuery) {
  // 1. Validate input first.
  const { valid, error } = validateSearchQuery(rawQuery);
  if (!valid) {
    return { results: [], error };
  }

  // 2. Perform case-insensitive match against name OR description.
  const normalised = rawQuery.trim().toLowerCase();

  const results = products.filter((product) => {
    const nameMatch =
      typeof product.name === "string" &&
      product.name.toLowerCase().includes(normalised);

    const descMatch =
      typeof product.description === "string" &&
      product.description.toLowerCase().includes(normalised);

    return nameMatch || descMatch;
  });

  return { results, error: null };
}

// --------------------------------------------------------------------------
// UI rendering helpers (DOM-based storefront)
// --------------------------------------------------------------------------

/**
 * Renders the search bar widget into a given container element.
 *
 * @param {HTMLElement} container
 * @param {Function} onSearch - Callback invoked with the validated query string.
 */
function renderSearchBar(container, onSearch) {
  container.innerHTML = `
    <form class="product-search-form" novalidate>
      <label for="product-search-input" class="product-search-label">
        Search products
      </label>
      <input
        id="product-search-input"
        class="product-search-input"
        type="search"
        placeholder="Search by name or description…"
        aria-label="Search products"
        maxlength="${MAX_QUERY_LENGTH}"
      />
      <button type="submit" class="product-search-submit">Search</button>
      <p class="product-search-error" role="alert" aria-live="polite"></p>
    </form>
  `;

  const form = container.querySelector(".product-search-form");
  const input = container.querySelector(".product-search-input");
  const errorEl = container.querySelector(".product-search-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const { valid, error } = validateSearchQuery(input.value);
    if (!valid) {
      // Surface validation error inline — do not proceed with search.
      errorEl.textContent = error;
      input.setAttribute("aria-invalid", "true");
      return;
    }

    input.setAttribute("aria-invalid", "false");
    onSearch(input.value.trim());
  });
}

/**
 * Renders search results (or a no-results message) into a given container element.
 *
 * @param {HTMLElement} container
 * @param {Array<{ id, name, image, price }>} results
 * @param {string} query - The query that was searched (used in the heading).
 */
function renderSearchResults(container, results, query) {
  if (results.length === 0) {
    container.innerHTML = `
      <p class="product-search-no-results">
        No products found for <strong>${_escapeHtml(query)}</strong>. Please try a different search term.
      </p>
    `;
    return;
  }

  const items = results
    .map(
      (product) => `
      <li class="product-search-result-item">
        <a href="/products/${_escapeHtml(String(product.id))}" class="product-search-result-link">
          <img
            src="${_escapeHtml(product.image)}"
            alt="${_escapeHtml(product.name)}"
            class="product-search-result-image"
          />
          <span class="product-search-result-name">${_escapeHtml(product.name)}</span>
          <span class="product-search-result-price">${_formatPrice(product.price)}</span>
        </a>
      </li>
    `
    )
    .join("");

  container.innerHTML = `
    <h2 class="product-search-results-heading">
      Results for <em>${_escapeHtml(query)}</em> (${results.length})
    </h2>
    <ul class="product-search-results-list">
      ${items}
    </ul>
  `;
}

// --------------------------------------------------------------------------
// Private utilities
// --------------------------------------------------------------------------

function _escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function _formatPrice(price) {
  return typeof price === "number"
    ? `$${price.toFixed(2)}`
    : String(price);
}

// --------------------------------------------------------------------------
// Exports
// --------------------------------------------------------------------------

module.exports = {
  validateSearchQuery,
  searchProducts,
  renderSearchBar,
  renderSearchResults,
};
