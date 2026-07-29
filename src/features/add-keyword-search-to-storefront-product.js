// Feature: Add keyword search to storefront product listing
// Customers currently have no way to search for products on the storefront, forcing them to browse manually and leading to frustration and drop-off. This feature adds a traditional search bar that accepts a keyword query, submits to a results page, and returns products whose name or description matches the search term. This improves product discoverability and helps customers find what they need quickly.

// Acceptance criteria:
// - A search bar is visible on the storefront with a submit button or Enter key support
// - Submitting a query navigates the user to a search results page displaying matching products
// - Search matches against product name and description fields only (case-insensitive)
// - If no results are found, a user-friendly empty state message is displayed
// - Partial keyword matches are supported (e.g., searching 'run' returns 'running shoes')

const MAX_QUERY_LENGTH = 200;

/**
 * Validates the search query parameter.
 *
 * Rules:
 *  - Must be a string
 *  - Must not be empty or whitespace-only
 *  - Must not exceed MAX_QUERY_LENGTH characters
 *  - Must not contain characters that could be used for injection attacks (< > " ' ; `)
 *
 * @param {string} query - The raw search query from user input.
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
function validateSearchQuery(query) {
  if (typeof query !== "string") {
    return { valid: false, error: "Search query must be a string." };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Search query must not be empty." };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      error: `Search query must not exceed ${MAX_QUERY_LENGTH} characters.`,
    };
  }

  // Guard against basic injection / XSS characters
  const forbiddenPattern = /[<>"';`]/;
  if (forbiddenPattern.test(trimmed)) {
    return {
      valid: false,
      error: "Search query contains invalid characters.",
    };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Searches products by keyword against their name and description fields.
 * Matching is case-insensitive and supports partial matches.
 *
 * @param {Array<{ id: string|number, name: string, description: string }>} products - Full product catalogue.
 * @param {string} query - The raw search query provided by the user.
 * @returns {{ results?: Array, error?: string, empty?: boolean }}
 */
function searchProducts(products, query) {
  // --- Input validation (addresses review comment) ---
  const validation = validateSearchQuery(query);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const keyword = validation.sanitized.toLowerCase();

  const results = products.filter(
    (product) =>
      product.name.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword)
  );

  if (results.length === 0) {
    return {
      results: [],
      empty: true,
      message: `No products found for "${validation.sanitized}". Try a different keyword.`,
    };
  }

  return { results };
}

/**
 * Renders the search bar HTML string.
 * The search bar supports both a submit button and Enter-key submission.
 *
 * @param {string} [currentQuery=""] - Pre-fills the input with an existing query (e.g. on results page).
 * @returns {string} HTML markup for the search bar.
 */
function renderSearchBar(currentQuery = "") {
  const safeQuery = currentQuery.replace(/"/g, "&quot;");
  return `
    <form class="storefront-search" action="/search" method="GET" role="search">
      <label for="storefront-search-input" class="sr-only">Search products</label>
      <input
        id="storefront-search-input"
        type="search"
        name="q"
        value="${safeQuery}"
        placeholder="Search products…"
        aria-label="Search products"
        maxlength="${MAX_QUERY_LENGTH}"
        autocomplete="off"
      />
      <button type="submit" aria-label="Submit search">Search</button>
    </form>
  `.trim();
}

/**
 * Renders the search results page content.
 *
 * @param {Array} products - Full product catalogue.
 * @param {string} query - Raw query string from the URL parameter.
 * @returns {{ html: string, error?: string }}
 */
function renderSearchResults(products, query) {
  const searchOutcome = searchProducts(products, query);

  if (searchOutcome.error) {
    return {
      html: `<p class="search-error">${searchOutcome.error}</p>`,
      error: searchOutcome.error,
    };
  }

  if (searchOutcome.empty) {
    return {
      html: `<p class="search-empty">${searchOutcome.message}</p>`,
    };
  }

  const items = searchOutcome.results
    .map(
      (product) => `
      <li class="search-result-item">
        <a href="/products/${product.id}">
          <strong>${product.name}</strong>
        </a>
        <p>${product.description}</p>
      </li>`
    )
    .join("\n");

  return {
    html: `<ul class="search-results">${items}</ul>`,
  };
}

module.exports = {
  validateSearchQuery,
  searchProducts,
  renderSearchBar,
  renderSearchResults,
};
