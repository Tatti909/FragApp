const FRAGELLA_BASE_URL = 'https://api.fragella.com/api/v1';
const FRAGELLA_API_KEY = process.env.EXPO_PUBLIC_FRAGELLA_API_KEY;

function toTextArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (typeof value === 'string') {
        return value;
      }

      if (typeof value?.name === 'string') {
        return value.name;
      }

      return '';
    })
    .filter(Boolean);
}

function firstRankName(rankings) {
  if (!Array.isArray(rankings) || rankings.length === 0) {
    return '';
  }

  const first = rankings[0];

  if (typeof first === 'string') {
    return first;
  }

  return first?.name ?? '';
}

function mapFragrance(item, index) {
  return {
    id: `${item?.Brand ?? 'brand'}-${item?.Name ?? 'name'}-${index}`,
    name: item?.Name ?? 'Unknown fragrance',
    brand: item?.Brand ?? 'Unknown brand',
    imageUrl: item?.['Image URL'] ?? item?.['Image Fallbacks']?.[0] ?? '',
    year: item?.Year ?? '',
    rating: item?.rating ?? '',
    longevity: item?.Longevity ?? '',
    sillage: item?.Sillage ?? '',
    bestSeason: firstRankName(item?.['Season Ranking']),
    bestOccasion: firstRankName(item?.['Occasion Ranking']),
    generalNotes: toTextArray(item?.['General Notes']),
    notes: {
      top: toTextArray(item?.Notes?.Top),
      middle: toTextArray(item?.Notes?.Middle),
      base: toTextArray(item?.Notes?.Base),
    },
  };
}

export async function searchFragrances(query) {
  if (!FRAGELLA_API_KEY) {
    throw new Error('API key is missing. Set EXPO_PUBLIC_FRAGELLA_API_KEY.');
  }

  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(`${FRAGELLA_BASE_URL}/fragrances?search=${encodedQuery}&limit=30`, {
    headers: {
      'x-api-key': FRAGELLA_API_KEY,
    },
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error('Search failed. Try again.');
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(mapFragrance);
}
