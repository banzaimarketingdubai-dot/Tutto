export const NICHE_CYBERPUNK_COVERS: Record<string, string> = {
  'cat-transport': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'cat-bikes': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'cat-cars': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  'ПРОКАТ': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'cat-realestate': 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
  'cat-housing': 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
  'cat-villas': 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
  'cat-apartments': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
  'ЖИЛЬЁ': 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
  'cat-exchange': 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
  'ДЕНЬГИ': 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
  'cat-cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'УСЛУГИ': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'КЛИНИНГ': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'cat-market': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  'ТОВАРЫ': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  'default': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
}

export function getNicheCoverImage(catIdOrName?: string, title?: string): string {
  if (!catIdOrName && !title) return NICHE_CYBERPUNK_COVERS['default']

  const text = `${catIdOrName || ''} ${title || ''}`.toLowerCase()

  if (/прокат|байк|скутер|nmax|pcx|авто|car|bike|rent|yacht|яхт/i.test(text)) {
    return NICHE_CYBERPUNK_COVERS['cat-transport']
  }
  if (/жильё|вилл|апарт|кондо|дом|villa|housing|condo/i.test(text)) {
    return NICHE_CYBERPUNK_COVERS['cat-realestate']
  }
  if (/деньги|обмен|валют|usdt|rub|thb|money|exchange/i.test(text)) {
    return NICHE_CYBERPUNK_COVERS['cat-exchange']
  }
  if (/товары|маркет|куплю|market|buy/i.test(text)) {
    return NICHE_CYBERPUNK_COVERS['cat-market']
  }
  if (/клининг|уборк|cleaning|service|услуг/i.test(text)) {
    return NICHE_CYBERPUNK_COVERS['cat-cleaning']
  }

  return NICHE_CYBERPUNK_COVERS['default']
}
