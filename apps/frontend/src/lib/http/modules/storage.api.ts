import { apiRequest } from "@/lib/http/request";
import { confirmedUploadSchema, presignedUploadSchema } from "@/lib/http/modules/storage.schema";

/** 浏览器直传对象存储：申请签名 URL → PUT 文件 → 后端核对对象，返回公开访问 URL。 */
export async function uploadFile(file: File) {
  const declared = { contentType: file.type, fileSize: file.size };
  const presigned = await apiRequest("storage/upload-url", presignedUploadSchema, {
    method: "post",
    json: { ...declared, filename: file.name },
  });

  // 签名包含 content-type，必须与申请时声明的一致。
  const response = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: file,
  });
  if (!response.ok) throw new Error("文件上传失败，请稍后再试");

  const confirmed = await apiRequest("storage/confirm", confirmedUploadSchema, {
    method: "post",
    json: { key: presigned.key, ...declared },
  });
  return confirmed.url;
}
