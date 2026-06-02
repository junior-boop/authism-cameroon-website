import { useEffect, useRef, useState } from "react";
import { slugify } from "../../lib/api";

export default function SlugField({
  sourceName,
  defaultValue = "",
  label = "Slug",
  name = "slug",
}: {
  sourceName: string;
  defaultValue?: string;
  label?: string;
  name?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(Boolean(defaultValue));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const form = input.form;
    if (!form) return;
    const source = form.elements.namedItem(sourceName) as HTMLInputElement | null;
    if (!source) return;
    const onInput = () => {
      if (!touched) setValue(slugify(source.value));
    };
    source.addEventListener("input", onInput);
    return () => source.removeEventListener("input", onInput);
  }, [sourceName, touched]);

  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      {label}
      <input
        ref={ref}
        type="text"
        name={name}
        value={value}
        onChange={(e) => {
          setTouched(true);
          setValue(slugify(e.target.value));
        }}
        placeholder="auto-généré depuis le titre"
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]"
      />
    </label>
  );
}
