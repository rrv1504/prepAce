const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

const { randomUUID } = require("crypto");
const { badRequest } = require("../utils/appError");
const logger = require("../utils/logger");

const DEFAULT_MAX_UPLOAD_MB = 20;

function getMaxUploadBytes() {
  const mb = Number(process.env.MAX_FILE_UPLOAD_MB || DEFAULT_MAX_UPLOAD_MB);
  return Math.max(1, mb) * 1024 * 1024;
}

function requireAzureConfig() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER || "resources";

  if (!connectionString) {
    throw badRequest("Azure Storage is not configured.");
  }

  return {
    connectionString,
    containerName,
  };
}

function getContainerClient() {
  const { connectionString, containerName } = requireAzureConfig();
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
}

function parseDataUrl(file) {
  if (!file || !file.startsWith("data:")) {
    throw badRequest("Invalid upload.");
  }

  const match = file.match(/^data:([^;,]+);base64,(.+)$/);

  if (!match) {
    throw badRequest("Invalid Base64.");
  }

  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");

  if (buffer.length > getMaxUploadBytes()) {
    throw badRequest("File too large.");
  }

  return {
    buffer,
    contentType,
  };
}

function safeFilename(name) {
  return String(name || "file")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function ensureExtension(filename, contentType) {
  if (/\.[A-Za-z0-9]+$/.test(filename)) {
    return filename;
  }

  if (contentType.includes("pdf")) return filename + ".pdf";
  if (contentType.includes("png")) return filename + ".png";
  if (contentType.includes("jpeg")) return filename + ".jpg";
  if (contentType.includes("mp4")) return filename + ".mp4";
  if (contentType.includes("plain")) return filename + ".txt";

  return filename;
}

// Only PDFs get forced-download disposition. Everything else (video,
// note, roadmap) opens inline in the browser tab.
function resolveDisposition(cleanFilename, resourceType) {
  const isPdf = resourceType === "pdf" || /\.pdf$/i.test(cleanFilename);
  const disposition = isPdf ? "attachment" : "inline";
  return `${disposition}; filename="${cleanFilename}"`;
}

async function uploadDataUrlToAzure({
  file,
  filename,
  folder = "resources",
  resourceType,
}) {
  const { buffer, contentType } = parseDataUrl(file);
  const containerClient = getContainerClient();
  await containerClient.createIfNotExists();

  const cleanFilename = ensureExtension(safeFilename(filename), contentType);
  const blobName = `${folder}/${randomUUID()}-${cleanFilename}`;

  logger.info("Uploading to Azure", {
    blobName,
    bytes: buffer.length,
  });

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType,
      blobContentDisposition: resolveDisposition(cleanFilename, resourceType),
    },
  });

  return {
    provider: "azure",
    url: blockBlobClient.url,
    storageKey: blobName,
    originalFilename: cleanFilename,
    bytes: buffer.length,
    contentType,
    format: cleanFilename.split(".").pop().toLowerCase(),
  };
}

// Used by the /open route — a plain browser navigation (window.open /
// redirect), so a short-lived SAS URL is fine here; the browser talks
// directly to Azure and there's no JS reading the response body.
async function generateDownloadUrl(blobName) {
  const { connectionString, containerName } = requireAzureConfig();

  const accountName = connectionString.match(/AccountName=([^;]+)/)[1];
  const accountKey = connectionString.match(/AccountKey=([^;]+)/)[1];

  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + 30);

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      expiresOn,
      permissions: BlobSASPermissions.parse("r"),
    },
    credential,
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sas}`;
}

// Used by the /download route — proxy-streams the blob through our own
// server so the browser only ever does a same-origin fetch(). This avoids
// needing CORS configured on the Azure Storage account, which is required
// if a redirect to Azure is followed by fetch() + response.blob().
async function streamBlobToResponse(blobName, res) {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  let downloadResponse;
  try {
    downloadResponse = await blockBlobClient.download();
  } catch (error) {
    if (error.statusCode === 404) {
      throw badRequest("File not found in storage.");
    }
    throw error;
  }

  res.setHeader(
    "Content-Type",
    downloadResponse.contentType || "application/octet-stream",
  );

  if (downloadResponse.contentLength != null) {
    res.setHeader("Content-Length", downloadResponse.contentLength);
  }

  const contentDisposition =
    downloadResponse.contentDisposition ||
    downloadResponse.blobDownloadHeaders?.contentDisposition;

  if (contentDisposition) {
    res.setHeader("Content-Disposition", contentDisposition);
  }

  return new Promise((resolve, reject) => {
    downloadResponse.readableStreamBody
      .on("error", (err) => {
        logger.error("Error streaming blob", { blobName, error: err.message });
        reject(err);
      })
      .on("end", resolve)
      .pipe(res);
  });
}

module.exports = {
  uploadDataUrlToAzure,
  generateDownloadUrl,
  streamBlobToResponse,
};
