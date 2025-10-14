import { createRouter } from "@/lib/create-router";
import { requireAuth } from "@/middlewares/require-auth";
import s3 from "@/s3";
import {
  storagePresignBodyValidator,
  storageReadBodyValidator,
} from "@/validators/storage.validator";
import slugify from "slugify";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
// const MAX_FILE_SIZE = 10 * 1024 * 1024;

// type StorageRouteDependencies = {};

// const defaultDependencies: StorageRouteDependencies = {};

export const createStorageRoute = () => {
  const router = createRouter();

  router.use("/*", requireAuth);

  router.post("/", storagePresignBodyValidator, async (c) => {
    const { fileName } = c.req.valid("json");
    const user = c.get("user")!;
    const ext = fileName.substring(fileName.lastIndexOf("."));
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));

    const extToType: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".heic": "image/heic",
      ".heif": "image/heif",
    };

    const contentType = extToType[ext] ?? "";

    if (!ALLOWED_TYPES.includes(contentType)) {
      return c.json({ error: "Invalid file type" }, 400);
    }

    const sanitizedFileName = slugify(nameWithoutExt, {
      lower: true,
      strict: true,
      trim: true,
    }).substring(0, 100);

    const uuid = Bun.randomUUIDv7("base64url");
    const key = `${user.id}/${sanitizedFileName}-${uuid}${ext}`;

    const uploadUrl = s3.presign(key, {
      expiresIn: 60 * 15,
      method: "PUT",
      type: contentType,
    });

    return c.json({ url: uploadUrl, key, contentType });
  });

  router.get("/", storageReadBodyValidator, async (c) => {
    const { key } = c.req.valid("query");

    const readUrl = s3.presign(key, {
      method: "GET",
      expiresIn: 60 * 60,
    });

    return c.json({ url: readUrl });
  });

  return router;
};

export default createStorageRoute();
