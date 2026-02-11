/**
 * Parse expense from natural language input
 * Supports formats like:
 * - "Coffee 5"
 * - "Lunch $12.50"
 * - "Gas 45.99 fuel"
 * - "Food 25 (restaurant)"
 */
function parseExpense(text) {
  try {
    // Remove extra whitespace
    text = text.trim();

    // Regex to match amount (with or without currency symbol)
    const amountRegex = /(\$)?(\d+\.?\d*)/;
    const match = text.match(amountRegex);

    if (!match) {
      return null;
    }

    const amount = parseFloat(match[2]);
    const currency = match[1] || '$';

    // Extract category (everything before the amount)
    let category = text.substring(0, match.index).trim();

    // Extract note (everything after the amount)
    let note = text.substring(match.index + match[0].length).trim();

    // Clean up category - remove parentheses if they exist
    const categoryMatch = category.match(/([a-zA-Z\s]+)/);
    if (categoryMatch) {
      category = categoryMatch[1].trim();
    }

    // If no category found, try to extract from note
    if (!category && note) {
      const noteWords = note.split(/[\s\(\)]/);
      category = noteWords[0] || 'Other';
    }

    // Default category if still empty
    if (!category) {
      category = 'Other';
    }

    // Capitalize category
    category = category
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return {
      amount,
      currency,
      category,
      note,
      date: new Date(),
    };
  } catch (error) {
    console.error('Error parsing expense:', error);
    return null;
  }
}


