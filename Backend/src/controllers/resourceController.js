const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { requireFields } = require("../utils/validation");
const { notFound, badRequest } = require("../utils/appError");

const {
  uploadDataUrlToAzure,
  generateDownloadUrl,
  streamBlobToResponse,
} = require("../services/azureBlobService");

const Resource = require("../models/Resource");

const uploadResourceFile = asyncHandler(async (req, res) => {
  requireFields(req.body, ["file"]);

  const upload = await uploadDataUrlToAzure({
    file: req.body.file,
    filename: req.body.filename,
    folder: req.body.folder || "prepace/resources",
    resourceType: req.body.type || req.body.resourceType,
  });
  console.log("Upload result:", upload);

  let resource = null;

  if (req.body.title && req.body.topic && req.body.type) {
    resource = await Resource.create({
      title: req.body.title,
      topic: req.body.topic,
      type: req.body.type,
      description: req.body.description || "",
      url: upload.url,
      uploadedBy: req.user._id,
      storageProvider: "azure",
      storageKey: upload.storageKey,
      originalFilename: upload.originalFilename,
      mimeType: upload.contentType,
      size: upload.bytes,
      format: upload.format,
    });
  }

  sendSuccess(res, {
    message: resource ? "File uploaded and resource created" : "File uploaded",
    data: resource
      ? {
          ...upload,
          resource,
        }
      : upload,
  });
});

// Used by AdminResourcePage's openResource() and by "inline" (non-pdf)
// links — a plain browser navigation, so a redirect to a short-lived SAS
// URL is fine. No JS reads the response body, so cross-origin doesn't matter.
const openResourceFile = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    throw notFound("Resource not found");
  }

  if (!resource.storageKey) {
    throw badRequest("Resource file not found");
  }

  const url = await generateDownloadUrl(resource.storageKey);
  console.log("SAS URL:", url);

  return res.redirect(url);
});

// Used by the student Resources page's downloadResource(), which does
// fetch(...).blob() to trigger a save-as download. That requires the
// response to be readable by JS, so we proxy-stream the blob through our
// own server (same-origin) instead of redirecting to Azure directly —
// redirecting here would need CORS configured on the storage account.
const downloadResourceFile = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    throw notFound("Resource not found");
  }

  if (!resource.storageKey) {
    throw badRequest("Resource file not found");
  }

  await streamBlobToResponse(resource.storageKey, res);
});

module.exports = {
  uploadResourceFile,
  downloadResourceFile,
  openResourceFile,
};
