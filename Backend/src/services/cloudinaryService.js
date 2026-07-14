const crypto = require('crypto')
const { badRequest } = require('../utils/appError')
const logger = require('../utils/logger')

const DEFAULT_MAX_UPLOAD_MB = 20

function getMaxUploadBytes() {
  const mb = Number(process.env.MAX_FILE_UPLOAD_MB || DEFAULT_MAX_UPLOAD_MB)
  return Math.max(1, mb) * 1024 * 1024
}

function requireCloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw badRequest('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
  }
  return { cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET }
}

function signParams(params, apiSecret) {
  const payload = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  return crypto.createHash('sha1').update(payload + apiSecret).digest('hex')
}

function validateFolder(folder) {
  const normalized = String(folder || 'prepace/resources').trim()
  if (!/^[a-zA-Z0-9/_-]+$/.test(normalized)) {
    throw badRequest('Cloudinary folder can contain only letters, numbers, slash, underscore, and hyphen')
  }
  return normalized
}

function dataUrlSizeBytes(file) {
  const base64 = String(file).split(',')[1] || ''
  return Math.ceil((base64.length * 3) / 4)
}

function sanitizePublicId(filename) {
  const cleaned = String(filename || 'resource')
    .trim()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return cleaned || `resource-${Date.now()}`
}

function extensionFromFilename(filename) {
  return String(filename || '').match(/\.([a-zA-Z0-9]{2,8})$/)?.[1]?.toLowerCase() || ''
}

async function uploadDataUrl({ file, folder = 'prepace/resources', resourceType = 'auto', filename }) {
  if (!file || typeof file !== 'string' || !file.startsWith('data:')) {
    throw badRequest('Upload file must be a base64 data URL')
  }
  const maxBytes = getMaxUploadBytes()
  const bytes = dataUrlSizeBytes(file)
  if (bytes > maxBytes) {
    throw badRequest(`File is too large. Maximum upload size is ${Math.round(maxBytes / 1024 / 1024)}MB`)
  }

  const safeFolder = validateFolder(folder)
  const safeResourceType = ['auto', 'image', 'video', 'raw'].includes(resourceType) ? resourceType : 'auto'
  const originalFilename = String(filename || '').trim()
  const originalExtension = extensionFromFilename(originalFilename)
  const publicIdBase = sanitizePublicId(originalFilename)
  const publicId = safeResourceType === 'raw' && originalExtension
    ? `${publicIdBase}.${originalExtension}`
    : publicIdBase

  const { cloudName, apiKey, apiSecret } = requireCloudinaryConfig()
  const timestamp = Math.floor(Date.now() / 1000)
  const params = {
    folder: safeFolder,
    public_id: publicId,
    timestamp,
    unique_filename: true,
  }
  const signature = signParams(params, apiSecret)
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('folder', safeFolder)
  form.append('public_id', publicId)
  form.append('unique_filename', 'true')
  form.append('signature', signature)

  logger.info('Uploading resource to Cloudinary', { folder: safeFolder, resourceType: safeResourceType, bytes, publicId })

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${safeResourceType}/upload`, {
    method: 'POST',
    body: form,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw badRequest(payload.error?.message || 'Cloudinary upload failed')

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    resourceType: payload.resource_type,
    format: payload.format || originalExtension,
    bytes: payload.bytes,
    originalFilename: originalFilename || payload.original_filename,
  }
}

module.exports = { uploadDataUrl }
