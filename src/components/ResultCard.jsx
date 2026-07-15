import CategoryChip from './CategoryChip'

const parseList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  }
  return []
}

const isUrl = (value) =>
  typeof value === 'string' && /^(https?:)?\/\//i.test(value)

export default function ResultCard({ analysis }) {
  if (!analysis) return null

  const category = analysis.category || analysis.category_name || 'Unknown'
  const categoryIcon = analysis.category_icon || analysis.icon || '♻️'
  const recyclable = analysis.recyclable
  const hazardous = analysis.hazardous
  const hazardWarning =
    analysis.hazard_warning || analysis.hazard || 'No hazard warning available.'
  const disposal =
    analysis.disposal_instructions || analysis.disposal || 'No disposal instructions available.'
  const recyclingSteps = parseList(
    analysis.recycling_steps || analysis.recycling
  )
  const ecoSuggestions = parseList(
    analysis.eco_suggestions || analysis.eco_friendly_tip || analysis.eco_friendly_suggestion
  )
  const acceptedFacilityTypes = parseList(
    analysis.accepted_facility_types || analysis.accepted_facilities
  )
  const aiSource = analysis.ai_source || analysis.aiSource || 'Groq'
  const rawGuide = typeof analysis === 'string' ? analysis : analysis.guide || null
  const allStructuredFields =
    category !== 'Unknown' || disposal || recyclingSteps.length || hazardWarning || acceptedFacilityTypes.length

  return (
    <div className="mt-6 max-w-4xl mx-auto rounded-3xl border border-emerald-900/60 bg-[#0c241c] p-6 text-emerald-50 shadow-[0_0_0_1px_rgba(74,222,128,0.08),0_20px_45px_rgba(0,0,0,0.35)]">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className="flex items-center justify-center w-24 h-24 rounded-3xl border border-emerald-800/70 bg-emerald-500/10 text-4xl shadow-inner">
            {isUrl(categoryIcon) ? (
              <img
                src={categoryIcon}
                alt={category}
                className="max-h-16 max-w-full rounded-2xl"
              />
            ) : (
              <span>{categoryIcon}</span>
            )}
          </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold">{category}</h3>
              <div className="mt-2">
                <CategoryChip category={category} icon={categoryIcon} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {recyclable === true && (
                <span className="rounded-full border border-emerald-700/60 bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-200">
                  Recyclable
                </span>
              )}
              {recyclable === false && (
                <span className="rounded-full border border-amber-700/60 bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-200">
                  Not recyclable
                </span>
              )}
              {hazardous === true && (
                <span className="rounded-full border border-red-700/60 bg-red-500/15 px-3 py-1 text-sm font-medium text-red-200">
                  Hazardous
                </span>
              )}
              {hazardous === false && (
                <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-sm font-medium text-slate-200">
                  Non-hazardous
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="rounded-full border border-emerald-800/70 bg-emerald-950/60 px-3 py-1 text-emerald-200">
              AI source: {aiSource}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-lg font-semibold">Disposal</h4>
          <p className="text-sm leading-7 whitespace-pre-wrap">
            {disposal}
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-lg font-semibold">Hazard Warning</h4>
          <p className="text-sm leading-7 whitespace-pre-wrap">
            {hazardWarning}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-lg font-semibold">Eco-Friendly Suggestions</h4>
          {ecoSuggestions.length > 0 ? (
            <ul className="list-disc list-inside mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {ecoSuggestions.map((suggestion, index) => (
                <li key={`${suggestion}-${index}`} className="leading-7">
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              No eco-friendly suggestions available.
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-lg font-semibold">Accepted Facility Types</h4>
          <div className="flex flex-wrap gap-2">
            {acceptedFacilityTypes.length > 0 ? (
              acceptedFacilityTypes.map((type, index) => (
                <span
                  key={`${type}-${index}`}
                  className="rounded-full border border-emerald-800/70 bg-emerald-950/50 px-3 py-1 text-sm text-emerald-100 shadow-sm"
                >
                  {type}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                No facility types available.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-lg font-semibold">Recycling Steps</h4>
        {recyclingSteps.length > 0 ? (
          <ol className="list-decimal list-inside space-y-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
            {recyclingSteps.map((step, idx) => (
              <li key={idx} className="leading-7">
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Recycling guidance is unavailable for this item.
          </p>
        )}
      </div>

      {!allStructuredFields && rawGuide && (
        <div className="mt-6 rounded-3xl border border-emerald-900/60 bg-[#0f2d1f] p-5">
          <h4 className="text-lg font-semibold">Waste Guidance</h4>
          <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {rawGuide}
          </p>
        </div>
      )}
    </div>
  )
}
