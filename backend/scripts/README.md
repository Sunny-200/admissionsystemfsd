# Maintenance Scripts

## Normalize document file names

Decodes URL-encoded `Document.fileName` values so presigned URLs resolve correctly.

```shell
npm run normalize:document-filenames
```

This script reads the current `DATABASE_URL` from `.env`.
