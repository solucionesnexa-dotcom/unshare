const demoFaces = [
  {
    id: 'face-mateo',
    childName: 'Mateo',
    avatarUrl:
      'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&w=320&q=80',
    embedding: [0.12, 0.45, 0.31, 0.78]
  },
  {
    id: 'face-valentina',
    childName: 'Valentina',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80',
    embedding: [0.68, 0.19, 0.23, 0.51]
  },
  {
    id: 'face-diego',
    childName: 'Diego',
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    embedding: [0.38, 0.74, 0.65, 0.22]
  }
];

const demoPosts = [
  {
    id: 'ig_8842',
    platform: 'Instagram',
    author: '@familia_viaja',
    caption: 'Mateo en su primer torneo de fútbol ⚽',
    childName: 'Mateo',
    riskScore: 81,
    location: { city: 'Miami', lat: 25.7617, lng: -80.1918 },
    postedAt: '2026-04-09T15:42:00Z',
    publicUrl: 'https://instagram.com/p/mock-8842',
    deleteRequestUrl: 'https://guardiankids.demo/delete-request?post=ig_8842',
    embedding: [0.11, 0.46, 0.34, 0.74]
  },
  {
    id: 'tt_1120',
    platform: 'TikTok',
    author: '@dance.school',
    caption: 'Valentina en ensayo grupal #kidsdance',
    childName: 'Valentina',
    riskScore: 67,
    location: { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    postedAt: '2026-04-08T19:16:00Z',
    publicUrl: 'https://www.tiktok.com/@dance.school/video/mock-1120',
    deleteRequestUrl: 'https://guardiankids.demo/delete-request?post=tt_1120',
    embedding: [0.66, 0.22, 0.21, 0.48]
  },
  {
    id: 'ig_9913',
    platform: 'Instagram',
    author: '@colegio_norte',
    caption: 'Clase abierta con Diego y su grupo',
    childName: 'Diego',
    riskScore: 58,
    location: { city: 'Houston', lat: 29.7604, lng: -95.3698 },
    postedAt: '2026-04-10T11:20:00Z',
    publicUrl: 'https://instagram.com/p/mock-9913',
    deleteRequestUrl: 'https://guardiankids.demo/delete-request?post=ig_9913',
    embedding: [0.34, 0.73, 0.67, 0.26]
  },
  {
    id: 'tt_7741',
    platform: 'TikTok',
    author: '@party.events',
    caption: 'Mateo celebrando su cumpleaños 🎂',
    childName: 'Mateo',
    riskScore: 90,
    location: { city: 'New York', lat: 40.7128, lng: -74.006 },
    postedAt: '2026-04-10T21:45:00Z',
    publicUrl: 'https://www.tiktok.com/@party.events/video/mock-7741',
    deleteRequestUrl: 'https://guardiankids.demo/delete-request?post=tt_7741',
    embedding: [0.14, 0.42, 0.29, 0.8]
  },
  {
    id: 'fb_2201',
    platform: 'Facebook',
    author: 'Familia Pérez',
    caption: 'Nuestro nieto Mateo en la fiesta del barrio ❤️',
    childName: 'Mateo',
    riskScore: 76,
    location: { city: 'Chicago', lat: 41.8781, lng: -87.6298 },
    postedAt: '2026-04-11T09:10:00Z',
    publicUrl: 'https://facebook.com/mock/posts/2201',
    deleteRequestUrl: 'https://guardiankids.demo/delete-request?post=fb_2201',
    embedding: [0.13, 0.43, 0.33, 0.76]
  },
  {
    id: 'fb_2202',
    platform: 'Facebook',
    author: 'Abuela de Valentina',
    caption: 'Mi sobrina Valentina en su presentación de baile 💃',
    childName: 'Valentina',
    riskScore: 62,
    location: { city: 'Phoenix', lat: 33.4484, lng: -112.074 },
    postedAt: '2026-04-11T13:00:00Z',
    publicUrl: 'https://facebook.com/mock/posts/2202',
    deleteRequestUrl: 'https://guardiankids.demo/delete-request?post=fb_2202',
    embedding: [0.67, 0.21, 0.2, 0.5]
  }
];

const demoAlerts = [
  {
    id: 'AL-302',
    message: 'Nuevo post con ubicación precisa detectado en TikTok para Mateo.',
    severity: 'Alta',
    at: '2026-04-10T22:01:00Z'
  },
  {
    id: 'AL-301',
    message: 'Coincidencia facial >85% en Instagram para Diego.',
    severity: 'Media',
    at: '2026-04-10T12:00:00Z'
  },
  {
    id: 'AL-303',
    message: 'Nueva publicación en Facebook detectada por familiar adulto.',
    severity: 'Media',
    at: '2026-04-11T13:05:00Z'
  }
];
