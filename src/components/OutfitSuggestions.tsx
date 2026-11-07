import { Sparkles } from "lucide-react";
import { PhotoImage } from "@/components/PhotoImage";
import type { Outfit } from "@/lib/outfits";

interface OutfitSuggestionsProps {
  outfits: Outfit[];
  temp: number;
}

export function OutfitSuggestions({ outfits, temp }: OutfitSuggestionsProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">What to wear</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Three looks picked for {Math.round(temp)}°F</p>

      <ol className="mt-6 grid gap-5 md:grid-cols-3">
        {outfits.map((outfit, index) => (
          <li
            key={outfit.name}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-200 dark:bg-slate-700">
              <PhotoImage
                src={outfit.image}
                alt={`${outfit.name} outfit idea`}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                Look {index + 1}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{outfit.name}</p>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Top</dt>
                  <dd className="text-slate-800 dark:text-slate-100">{outfit.top}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Bottom</dt>
                  <dd className="text-slate-800 dark:text-slate-100">{outfit.bottom}</dd>
                </div>
              </dl>
              <p className="mt-auto border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {outfit.tip}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
