const CLOUD_NAME = "skdq8mcw";
const UPLOAD_PRESET = "campus-barter-avatars";

/* ============================================================
   Resize/compress in the browser BEFORE upload. A raw phone
   photo can easily be 5-10MB — nobody needs that for a small
   avatar circle, and uploading it raw would be slow and wasteful
   on mobile data. Shrinks to a max dimension and re-encodes as
   JPEG at a reasonable quality, using the browser's built-in
   Canvas API — no extra library needed for this.
   ============================================================ */
function resizeImage(file, maxSize = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = reject;

    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
    };
    img.onerror = reject;

    reader.readAsDataURL(file);
  });
}

/* Unsigned upload — the browser talks directly to Cloudinary,
   no backend function or secret key involved. The upload_preset
   (created as "unsigned" in the Cloudinary dashboard) is what
   authorizes this without needing real credentials in the code. */
export async function uploadAvatar(file) {
  try {
    const resizedBlob = await resizeImage(file);

    const formData = new FormData();
    formData.append("file", resizedBlob);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, message: data.error && data.error.message ? data.error.message : "Upload failed." };
    }

    return { ok: true, url: data.secure_url };
  } catch (error) {
    return { ok: false, message: "Something went wrong uploading your photo." };
  }
}