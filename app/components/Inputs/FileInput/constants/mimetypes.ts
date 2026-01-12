export function MIMETYPES() {
  return [
  // ALL
    { group: $t('general.all'), label: 'mimetype.*', id: '*/*' },

    // TEXT
    { group: $t('mimetype.text'), label: $t('mimetype.text/plain'), id: 'text/plain' },
    { group: $t('mimetype.text'), label: $t('mimetype.text/html'), id: 'text/html' },
    { group: $t('mimetype.text'), label: $t('mimetype.text/css'), id: 'text/css' },
    { group: $t('mimetype.text'), label: $t('mimetype.text/csv'), id: 'text/csv' },
    { group: $t('mimetype.text'), label: $t('mimetype.text/xml'), id: 'text/xml' },
    { group: $t('mimetype.text'), label: $t('mimetype.text/*'), id: 'text/*' },

    // IMAGES
    { group: $t('mimetype.image'), label: $t('mimetype.image/jpeg'), id: 'image/jpeg' },
    { group: $t('mimetype.image'), label: $t('mimetype.image/png'), id: 'image/png' },
    { group: $t('mimetype.image'), label: $t('mimetype.image/gif'), id: 'image/gif' },
    { group: $t('mimetype.image'), label: $t('mimetype.image/bmp'), id: 'image/bmp' },
    { group: $t('mimetype.image'), label: $t('mimetype.image/webp'), id: 'image/webp' },
    {
      group: $t('mimetype.image'),
      label: $t('mimetype.image/svg+xml'),
      id: 'image/svg+xml',
    },
    { group: $t('mimetype.image'), label: $t('mimetype.image/tiff'), id: 'image/tiff' },
    {
      group: $t('mimetype.image'),
      label: $t('mimetype.image/x-icon'),
      id: 'image/x-icon',
    },
    { group: $t('mimetype.image'), label: $t('mimetype.image/*'), id: 'image/*' },

    // AUDIO
    { group: $t('mimetype.audio'), label: $t('mimetype.audio/midi'), id: 'audio/midi' },
    { group: $t('mimetype.audio'), label: $t('mimetype.audio/mpeg'), id: 'audio/mpeg' },
    { group: $t('mimetype.audio'), label: $t('mimetype.audio/webm'), id: 'audio/webm' },
    { group: $t('mimetype.audio'), label: $t('mimetype.audio/ogg'), id: 'audio/ogg' },
    { group: $t('mimetype.audio'), label: $t('mimetype.audio/wav'), id: 'audio/wav' },
    { group: $t('mimetype.audio'), label: $t('mimetype.audio/*'), id: 'audio/*' },

    // VIDEO
    { group: $t('mimetype.video'), label: $t('mimetype.video/webm'), id: 'video/webm' },
    { group: $t('mimetype.video'), label: $t('mimetype.video/ogg'), id: 'video/ogg' },
    { group: $t('mimetype.video'), label: $t('mimetype.video/mp4'), id: 'video/mp4' },
    { group: $t('mimetype.video'), label: $t('mimetype.video/*'), id: 'video/*' },

    // OTHER
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/octet-stream'),
      id: 'application/octet-stream',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/pkcs12'),
      id: 'application/pkcs12',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/vnd.mspowerpoint'),
      id: 'application/vnd.mspowerpoint',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/xhtml+xml'),
      id: 'application/xhtml+xml',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/xml'),
      id: 'application/xml',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/pdf'),
      id: 'application/pdf',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/json'),
      id: 'application/json',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/ld+json'),
      id: 'application/ld+json',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/zip'),
      id: 'application/zip',
    },
    {
      group: $t('mimetype.other'),
      label: $t('mimetype.application/*'),
      id: 'application/*',
    },

    // OFFICE
    {
      group: $t('mimetype.office'),
      label: $t('mimetype.application/msword'),
      id: 'application/msword',
    },
    {
      group: $t('mimetype.office'),
      label: $t(
        'mimetype.application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
      id: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      group: $t('mimetype.office'),
      label: $t(
        'mimetype.application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
      id: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    {
      group: $t('mimetype.office'),
      label: $t(
        'mimetype.application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ),
      id: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
    {
      group: $t('mimetype.office'),
      label: $t('mimetype.application/vnd.ms-excel'),
      id: 'application/vnd.ms-excel',
    },

  // FONT
  // { label: $t('mimetype.font/otf'), id: 'font/otf' },
  // { label: $t('mimetype.font/ttf'), id: 'font/ttf' },
  // { label: $t('mimetype.font/woff'), id: 'font/woff' },
  // { label: $t('mimetype.font/woff2'), id: 'font/woff2' },
  // { label: $t('mimetype.font/*'), id: 'font/*' },
  ]
}
