import { useState } from "react";
import { mediaUrl } from "../../lib/api";
import MediaPickerModal from "./MediaPickerModal";

type Props = {
  name: string;
  label?: string;
  token: string;
  defaultValue?: string | null;
  defaultFolder?: string;
};

function parseAlbum(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
}

export default function AlbumField({ name, label = "Album photo", token, defaultValue, defaultFolder = "associations" }: Props) {
  const [keys, setKeys] = useState<string[]>(parseAlbum(defaultValue));
  const [pickerOpen, setPickerOpen] = useState(false);

  const add = (key: string) => {
    setKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setPickerOpen(false);
  };
  const remove = (key: string) => setKeys((prev) => prev.filter((k) => k !== key));
  const move = (idx: number, dir: -1 | 1) => {
    setKeys((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="text-xs text-[#00bcd4] hover:text-[#00acc1] font-medium"
        >
          + Ajouter une photo
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-400">
          Aucune photo dans l'album
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {keys.map((key, idx) => {
            const url = mediaUrl(key);
            return (
              <div key={key} className="relative group border border-gray-200 rounded overflow-hidden bg-gray-50">
                {url ? (
                  <img src={url} alt="" className="w-full h-24 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-gray-200" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="bg-white/20 hover:bg-white/40 disabled:opacity-30 px-2 py-0.5 rounded">←</button>
                    <button type="button" onClick={() => move(idx, 1)} disabled={idx === keys.length - 1} className="bg-white/20 hover:bg-white/40 disabled:opacity-30 px-2 py-0.5 rounded">→</button>
                  </div>
                  <button type="button" onClick={() => remove(key)} className="bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded">Retirer</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input type="hidden" name={name} value={JSON.stringify(keys)} />

      {pickerOpen && (
        <MediaPickerModal
          token={token}
          defaultFolder={defaultFolder}
          onSelect={add}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
