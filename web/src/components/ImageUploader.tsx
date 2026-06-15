import { useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  MAX_PRODUCT_IMAGES,
  MAX_IMAGE_BYTES,
  compressImageFile,
  formatFileSize,
} from "../utils/imageUpload";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = MAX_PRODUCT_IMAGES - images.length;
    if (remaining <= 0) {
      setError(t("seller.imageMaxCount", { max: MAX_PRODUCT_IMAGES }));
      return;
    }

    const toProcess = Array.from(files).slice(0, remaining);
    setLoading(true);

    try {
      const compressed: string[] = [];
      for (const file of toProcess) {
        if (!file.type.startsWith("image/")) {
          setError(t("seller.imageNotImage"));
          continue;
        }
        try {
          const dataUrl = await compressImageFile(file);
          compressed.push(dataUrl);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "";
          if (msg === "TOO_LARGE") {
            setError(t("seller.imageTooLarge", { max: formatFileSize(MAX_IMAGE_BYTES) }));
          } else {
            setError(t("seller.imageUploadError"));
          }
        }
      }
      if (compressed.length > 0) {
        onChange([...images, ...compressed]);
      }
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="image-uploader">
      <div className="image-uploader-header">
        <label>{t("seller.photos")}</label>
        <span className="image-uploader-hint">
          {t("seller.photosHint", {
            max: MAX_PRODUCT_IMAGES,
            size: formatFileSize(MAX_IMAGE_BYTES),
          })}
        </span>
      </div>

      <div className="image-uploader-grid">
        {images.map((src, i) => (
          <div key={`${i}-${src.slice(0, 32)}`} className="image-uploader-thumb">
            <img src={src} alt="" />
            {i === 0 && <span className="image-uploader-main">{t("seller.mainPhoto")}</span>}
            <div className="image-uploader-actions">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="←">←</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} title="→">→</button>
              <button type="button" className="btn-danger-sm" onClick={() => remove(i)}>×</button>
            </div>
          </div>
        ))}

        {images.length < MAX_PRODUCT_IMAGES && (
          <button
            type="button"
            className="image-uploader-add"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            {loading ? t("seller.uploading") : "+ " + t("seller.addPhoto")}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="field-error">{error}</p>}
      <p className="image-uploader-count">
        {images.length} / {MAX_PRODUCT_IMAGES}
      </p>
    </div>
  );
}
