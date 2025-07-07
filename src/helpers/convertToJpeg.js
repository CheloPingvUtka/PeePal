export async function convertImageToJpeg(file) {
  const name = (file.name || '').toLowerCase();

  if (name.endsWith('.heic') || name.endsWith('.heif')) {
    console.warn("⚠️ HEIC/HEIF-файл — не конвертируется, передаётся как есть");
  }

  return file;
}
