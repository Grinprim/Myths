(function () {
  const STORAGE_KEY = 'mythblitz.cards.v1';

  function safeParse(raw) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function getAllCards() {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  }

  function setAllCards(cards) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }

  function generateId() {
    return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function getCardById(id) {
    return getAllCards().find((card) => card.id === id) || null;
  }

  function upsertCard(nextCard) {
    const cards = getAllCards();
    const idx = cards.findIndex((card) => card.id === nextCard.id);

    if (idx >= 0) {
      cards[idx] = nextCard;
    } else {
      cards.push(nextCard);
    }

    setAllCards(cards);
    return nextCard;
  }

  function deleteCardById(id) {
    const cards = getAllCards().filter((card) => card.id !== id);
    setAllCards(cards);
    return cards;
  }

  function duplicateCard(id) {
    const source = getCardById(id);
    if (!source) return null;

    const copy = {
      ...source,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: `${source.name || 'Card'} Copy`
    };

    upsertCard(copy);
    return copy;
  }

  window.MythblitzCardStorage = {
    STORAGE_KEY,
    getAllCards,
    setAllCards,
    generateId,
    getCardById,
    upsertCard,
    deleteCardById,
    duplicateCard
  };
})();
