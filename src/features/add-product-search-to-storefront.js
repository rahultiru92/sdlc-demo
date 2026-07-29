// Auto-generated stub for: Add product search to storefront
// Customers currently have no way to search for products, forcing them to browse manually and leading to frustration and lost conversions. This feature adds a search bar to the storefront with a submit button that queries products by name and description, returning a results page with matching items.

// Acceptance criteria:
// - A search bar with a submit button is visible on the storefront
// - Submitting a query returns a results page showing products whose name or description contains the search term
// - If no products match, a friendly empty-state message is displayed
// - Search is case-insensitive

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 100;

/**
 * Validates the search input string.
 * @param {string} query - The raw search input from the user.
 * @returns {{ valid: boolean, error?: string }} Validation result.
 */
function validateSearchInput(query) {
  if (typeof query !== "string") {
    return { valid: false, error: "Search query must be a string." };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Search query must not be empty." };
  }

  if (trimmed.length < SEARCH_MIN_LENGTH) {
    return {
      valid: false,
      error: `Search query must be at least ${SEARCH_MIN_LENGTH} characters.`,
    };
  }

  if (trimmed.length > SEARCH_MAX_LENGTH) {
    return {
      valid: false,
      error: `Search query must not exceed ${SEARCH_MAX_LENGTH} characters.`,
    };
  }

  return { valid: true };
}

/**
 * Searches products by name or description (case-insensitive).
 * @param {string} query - The validated search term.
 * @param {Array<{ name: string, description: string }>} products - Product catalogue.
 * @returns {Array} Matching products.
 */
function searchProducts(query, products) {
  const { valid, error } = validateSearchInput(query);
  if (!valid) {
    throw new Error(error);
  }

  const normalised = query.trim().toLowerCase();

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalised) ||
      product.description.toLowerCase().includes(normalised)
  );
}

/**
 * Renders the search results or an empty-state message.
 * @param {Array} results - Products returned by searchProducts().
 * @returns {string} HTML string for the results page.
 */
function renderSearchResults(results) {
  if (results.length === 0) {
    return `<div class="search-empty-state">
  <p>No products matched your search. Try different keywords!</p>
</div>`;
  }

  const items = results
    .map(
      (product) => `<li class="search-result-item">
  <h3>${product.name}</h3>
  <p>${product.description}</p>
</li>`
    )
    .join("\n");

  return `<ul class="search-results">\n${items}\n</ul>`;
}

/**
 * Entry point: handles a search submission from the storefront.
 * @param {string} query - Raw input from the search bar.
 * @param {Array} products - Full product catalogue.
 * @returns {{ html: string, error?: string }}
 */
function handleSearchSubmit(query, products) {
  const { valid, error } = validateSearchInput(query);
  if (!valid) {
    return { html: "", error };
  }

  const results = searchProducts(query, products);
  return { html: renderSearchResults(results) };
}

module.exports = {
  validateSearchInput,
  searchProducts,
  renderSearchResults,
  handleSearchSubmit,
};
