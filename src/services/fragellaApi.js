const FRAGELLA_BASE_URL = 'https://api.fragella.com/api/v1';
const FRAGELLA_API_KEY = process.env.EXPO_PUBLIC_FRAGELLA_API_KEY;
const DESIGNER_BRANDS = ['Dior', 'Chanel', 'Yves Saint Laurent'];
const NICHE_BRANDS = ['Creed', 'Xerjoff', 'Maison Francis Kurkdjian'];

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

function fragranceKey(fragrance) {
  return `${fragrance.brand}-${fragrance.name}`.toLowerCase();
}

function uniqueFragrances(fragrances) {
  const seenKeys = new Set();

  return fragrances.filter((fragrance) => {
    const key = fragranceKey(fragrance);

    if (seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });
}

function toNumber(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return number;
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

async function fetchFragrances(path) {
  if (!FRAGELLA_API_KEY) {
    throw new Error('API key is missing. Set EXPO_PUBLIC_FRAGELLA_API_KEY.');
  }

  const response = await fetch(`${FRAGELLA_BASE_URL}${path}`, {
    headers: {
      'x-api-key': FRAGELLA_API_KEY,
    },
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error('Fragrance request failed. Try again.');
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(mapFragrance);
}

async function getBrandFragrances(brandName) {
  return fetchFragrances(`/brands/${encodeURIComponent(brandName)}?limit=30`);
}

async function getMatchedFragrances(params) {
  return fetchFragrances(`/fragrances/match?${params}&limit=10`);
}

async function getTopRatedFromBrands(brandNames) {
  const results = await Promise.all(brandNames.map(getBrandFragrances));

  return uniqueFragrances(results.flat())
    .filter((fragrance) => fragrance.rating)
    .sort((first, second) => toNumber(second.rating) - toNumber(first.rating))
    .slice(0, 10);
}

export async function getHomeFragranceSections() {
  const [freshClean, vanillaAmber, topDesigner, topNiche] = await Promise.all([
    getMatchedFragrances('general=bergamot,citrus,musk'),
    getMatchedFragrances('general=vanilla,amber'),
    getTopRatedFromBrands(DESIGNER_BRANDS),
    getTopRatedFromBrands(NICHE_BRANDS),
  ]);

  return {
    freshClean,
    vanillaAmber,
    topDesigner,
    topNiche,
  };
}
