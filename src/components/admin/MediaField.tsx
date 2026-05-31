import { useState } from "react";
import { mediaUrl } from "../../lib/api";
import MediaPickerModal from "./MediaPickerModal";

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;

type Props = {
  label: string;
  name: string;
  token: string;
  currentKey?: string | null;
  defaultFolder?: string;
};

export default function MediaField({ label, name, token, currentKey, defaultFolder }: Props) {
  const [selectedKey, setSelectedKey] = useState<string | null>(currentKey ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const url = mediaUrl(selectedKey);
  const isImage = selectedKey ? IMAGE_EXTS.test(selectedKey) : false;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 bg-gray-50">
        {selectedKey ? (
          <>
            {isImage && url ? (
              <img src={url} alt="" className="w-12 h-12 object-cover rounded shrink-0" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{selectedKey.split("/").pop()}</p>
              {url && (
                <a href={url} target="_blank" className="text-xs text-blue-600 hover:underline">
                  Voir le fichier
                </a>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="text-xs text-[#00bcd4] hover:text-[#00acc1] font-medium"
              >
                Changer
              </button>
              <button
                type="button"
                onClick={() => setSelectedKey(null)}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Retirer
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            Choisir depuis la médiathèque
          </button>
        )}
      </div>
      <input type="hidden" name={name} value={selectedKey ?? ""} />
      {pickerOpen && (
        <MediaPickerModal
          token={token}
          defaultFolder={defaultFolder}
          onSelect={(key) => { setSelectedKey(key); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
